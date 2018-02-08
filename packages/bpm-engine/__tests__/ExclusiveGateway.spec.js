import fs from 'fs';

import BPMEngine from 'bpm-engine';

describe('ExclusiveGateway', () => {
  it('Does not continue if no DefaultSequenceFlow was found', async () => {
    const bpm = new BPMEngine();

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(
        `${__dirname}/diagrams/ExclusiveGatewayWithoutDefaultSequenceFlow.bpmn`,
        'utf-8',
      ),
    });

    await token.exec();
    expect(token.next).toMatchSnapshot();
  });

  it('Continues to the evaluated conditions paths', async () => {
    const passedTasks = [];

    class TaskPlugin extends BPMEngine.Plugins.Element {
      // eslint-disable-next-line
      onActive(definition) {
        if (definition.id === 'Task_02ex5w4') {
          passedTasks.push(definition.id);
        }
        if (definition.id === 'Task_1tasl7x') {
          passedTasks.push(definition.id);
        }
      }
    }

    const taskPlugin = new TaskPlugin();

    const bpm = new BPMEngine({
      plugins: [taskPlugin],
    });

    const tiTop = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ExclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        top: true,
      },
    });

    const tiBottom = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ExclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        bottom: true,
      },
    });

    const tiDefault = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ExclusiveGateway.bpmn`, 'utf-8'),
      payload: {},
    });

    await tiTop.exec();
    await tiBottom.exec();
    await tiDefault.exec();

    expect(tiTop.next).toMatchSnapshot();
    expect(tiBottom.next).toMatchSnapshot();
    expect(tiDefault.next).toMatchSnapshot();
    expect(passedTasks).toMatchSnapshot();
  });
});
