#### Installation

    npm install micromachine-amqp --save

#### Creating a new service

    import { Service } from 'micromachine';

    class SayHelloService extends Service {

      inputs() {
        super.inputs();
        super.required('firstname');
        super.optional('lastname')
      }

      // Implement your microservice using Single Responsability Principle
      execute(operation) {
        return { message: `Running microservice saying hello to ${operation.firstname}` };
      }
    }

#### Using this service as a RabbitMQ consumer

You can simply declare in your index.js

    const service = new SayHelloService(() => new AMQPRuntime({
      connection: 'amqp://localhost:5672',
      queue: "tasks"
    }));

    service.await((operation) => {
      console.log(operation);
    });

    setTimeout(() => {
      const runtime = new AMQPRuntime({
        connection: 'amqp://localhost:5672',
        queue: "tasks"
      });
      runtime.dispatch({
        firstname: "Ludo"
      });
    }, 1000);
