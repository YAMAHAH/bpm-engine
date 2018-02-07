import fs from 'fs';

import JSPE from 'jspe';

describe('ExclusiveGateway', () => {
  it('Does not continue if no DefaultSequenceFlow was found', async () => {
    const jspe = new JSPE();

    const token = await jspe.createProcessInstance({
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

    class TaskPlugin extends jspe.Plugins.Element {
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

    const jspe = new JSPE({
      plugins: [taskPlugin],
    });

    const tiTop = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ExclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        top: true,
      },
    });

    const tiBottom = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ExclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        bottom: true,
      },
    });

    const tiDefault = await jspe.createProcessInstance({
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
