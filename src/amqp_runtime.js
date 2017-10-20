import amqp from 'amqplib';

class AMQPRuntime {

  constructor(options = {}) {
    this.connection = amqp.connect(options.connection);
    this.queue = options.queue;
  }

  register(service, callback) {
    this.service = service;
    return new Promise((resolve, reject) => {

      this.connection.then((connection) => {
        process.once('SIGINT', function() { connection.close(); });

        return connection.createChannel().then((channel) => {
          var ok = channel.assertQueue(this.queue, {durable: true});
          ok = ok.then((_qok) => {
            return channel.consume(this.queue, (message) => {
              const payload = JSON.parse(message.content).payload;
              console.log("> Received %s", payload);
              this.service.runOperation(payload, callback, resolve, reject);
            }, {noAck: true});
          });
          return ok.then((_consumeOk) => {
            console.log(`> ${this.service.constructor.name} consuming messages from '${this.queue}'. To exit press CTRL+C`);
          });
        });
      }).catch(console.warn);
    });
  }

  dispatch(message) {
    const runtime = this;
    return this.connection.then(connection => connection.createChannel())
      .then((channel) => {
        var ok = channel.assertQueue(runtime.queue, {durable: true});
        return ok.then(function(_qok) {
          const payload = { payload: message };
          channel.sendToQueue(runtime.queue, Buffer.from(JSON.stringify(payload)));
          console.log("Message sent");
          return channel.close();
        });
      }).catch(console.warn);
  }
}

export { AMQPRuntime as default };
