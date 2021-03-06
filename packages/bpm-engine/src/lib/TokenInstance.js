import BPMNModdle from 'bpmn-moddle';
import debug from 'lib/debug';
import getFlowObjectType from 'lib/getFlowObjectType';
import { UserTask, ServiceTask } from 'lib/Elements';
import * as constants from 'lib/constants';

const log = debug('engine');

const moddle = new BPMNModdle();

const setParticipants = (flowElements, id, name) => {
  flowElements.forEach((flowElement) => {
    flowElement.participant = {
      id,
      name,
    };

    if (flowElement.flowElements) {
      setParticipants(flowElement.flowElements, id, name);
    }
  });
};

const setLanes = (flowElements, lane) => {
  flowElements.forEach((flowElement) => {
    if (!flowElement.lanes) {
      flowElement.lanes = [{ id: lane.id, name: lane.name }];
    }
    else {
      flowElement.lanes.push({ id: lane.id, name: lane.name });
    }

    if (flowElement.flowElements) {
      setLanes(flowElement.flowElements, lane);
    }
  });
};

const getNexts = flowObject =>
  // eslint-disable-next-line
  (flowObject.next
    ? [flowObject.next]
    : flowObject.definition.outgoing
      ? flowObject.definition.outgoing
      : [flowObject.definition.targetRef]);

const parseParticipantsAndLanes = (rootElements) => {
  // set participant for all flowElements
  rootElements.forEach((el) => {
    if (el.$type === constants.BPMN_COLLABORATION) {
      el.get('participants').forEach(({ id, name, processRef }) => {
        setParticipants(processRef.flowElements, id, name);
      });
    }
  });

  // set lanes for all flowElements
  rootElements.forEach((el) => {
    if (el.$type === constants.BPMN_PROCESS) {
      el.get('laneSets').forEach((laneSet) => {
        if (laneSet.lanes) {
          laneSet.lanes.forEach((lane) => {
            setLanes(lane.flowNodeRef, lane);
            if (lane.childLaneSet) {
              lane.childLaneSet.lanes.forEach((childLane) => {
                setLanes(childLane.flowNodeRef, childLane);
              });
            }
          });
        }
      });
    }
  });
};

export default class TokenInstance {
  constructor({
    processId,
    tokenId,
    payload,
    workflowDefinition,
    status,
    currentActivity,
    isSubProcess,
    parent,
    engine,
  }) {
    this.workflowDefinition = workflowDefinition;
    this.engine = engine;

    Object.assign(this, {
      tokenId,
      processId,
      payload,
      parent,
      isSubProcess,
      currentActivity,
      status,
    });
  }

  toJSON() {
    const result = {};
    result.currentActivity = this.next && this.next.id;
    result.processId = this.processId;
    result.tokenId = this.tokenId;
    result.payload = this.payload;
    result.parent = this.parent;
    result.isSubProcess = this.isSubProcess;
    result.status = this.status;

    return result;
  }

  initialize = () =>
    new Promise((resolve, reject) => {
      moddle.fromXML(this.workflowDefinition, constants.BPMN_DEFINITIONS, (err, definitions) => {
        if (err) {
          return reject(err);
        }

        const rootElements = definitions.get('rootElements');

        const rootElement = rootElements.find(rootEl =>
          rootEl.$type === constants.BPMN_PROCESS &&
            rootEl.flowElements.find(flowEl => flowEl.$type === constants.BPMN_EVENT_START));

        this.flowObjects = rootElement.get('flowElements');

        parseParticipantsAndLanes(rootElements);

        log('flowObjects parsed');

        return resolve();
      });
    });

  createFlowObject(definition) {
    const FlowObjectType = getFlowObjectType(definition);
    const scopedPlugins = this.engine.plugins;

    const plugins = Object.assign({}, scopedPlugins.element);

    if (FlowObjectType === UserTask) {
      Object.assign(plugins, scopedPlugins.userTask);
    }
    if (FlowObjectType === ServiceTask) {
      Object.assign(plugins, scopedPlugins.serviceTask);
    }

    const flowObject = new FlowObjectType({
      definition,
      plugins,
      tokenInstance: this,
    });

    return flowObject;
  }

  execute = async () => {
    if (this.next) {
      this.lastActivity = this.next.id;
    }
    if (!this.status) {
      this.next = this.flowObjects.find(el => el.$type === constants.BPMN_EVENT_START);
    }
    else if (this.nexts) {
      if (this.nexts.length === 1) {
        [this.next] = this.nexts;
      }
      else {
        log('TODO');
        return Promise.resolve();
      }
    }

    if (!this.next) {
      throw new Error('No next flowObject');
    }

    const flowObject = this.createFlowObject(this.next);

    // if thhe current flow object is not a sequenceflow
    // - make it ready
    // - make it active
    if (flowObject.constructor.name !== 'SequenceFlow') {
      // if we execute a paused token
      // make it move
      if (this.status === 'paused') {
        this.status = 'running';
      }
      else {
        // call the makeReady of the current flowObject
        await flowObject.makeReady();

        // if the token is still moving (makeReady did not make it pause)
        // then call the makeActive of the current flowObject
        if (this.status === 'running') {
          await flowObject.makeActive();
        }
      }

      // if we are in a moving token
      // - complete the activity
      if (this.status === 'running') {
        await flowObject.makeComplete();
      }
    }

    // if the token is still moving
    // continue execution (automation KEY-concept)
    if (this.status === 'running') {
      this.nexts = getNexts(flowObject);
      return this.execute();
    }

    return Promise.resolve();
  };

  persistUpdate = () =>
    this.engine.persist.tokenInstances.update({ tokenId: this.tokenId }, { $set: this.toJSON() });

  persistCreate = () => this.engine.persist.tokenInstances.create(this.toJSON());
}
