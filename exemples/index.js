const Micromachine = require('../lib/micromachine');

class SayHelloService extends Micromachine.Service {

  // Implement your microservice using Single Responsability Principle
  execute() {
    if (false) {
      throw new Error('Something went wrong');
    }
    return { message: `Running microservice saying hello to ${this.first_name}` };
  }
}

SayHelloService.inputs = {
  required: ['first_name'],
  optional: ['last_name'],
};

let service = new SayHelloService();
service.run({ first_name: 'Ludo' })
  .then((data) => { console.log(data); })
  .catch((error) => { console.error(error); });

service = new SayHelloService();
service.runtime = new Micromachine.HTTPEndpoint({
  port: 5002,
  path: '/hello',
});

service.run()
  .then((data) => {
    const response = { payload: data };
    console.log(response);
    return response;
  })
  .catch((error) => { console.error(error); });
