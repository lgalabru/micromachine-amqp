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
            return channel.consume(this.queue, (msg) => {
              console.log(" [x] Received '%s'", msg.content.toString());
              this.service.runOperation(JSON.parse(msg.content), callback, resolve, reject);
            }, {noAck: true});
          });
          return ok.then((_consumeOk) => {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
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
          channel.sendToQueue(runtime.queue, Buffer.from(JSON.stringify(message)));
          console.log("Message sent");
          return channel.close();
        });
      }).catch(console.warn);
  }
}

export { AMQPRuntime as default };
