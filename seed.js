const User = require("./models/user.js");
const Message = require("./models/message.js");

const user1 = {
  username: "Justin",
  password: "pass",
  first_name: "Justin",
  last_name: "Clark",
  phone: 123456
};

const user2 = {
  username: "Jimmy",
  password: "pass",
  first_name: "Jimmy",
  last_name: "Clark",
  phone: 123456
};

const user3 = {
  username: "Dave",
  password: "pass",
  first_name: "Dave",
  last_name: "Clark",
  phone: 123456
};


//

const message1 = {
  from_username: "Justin",
  to_username: "Jimmy",
  body: "Hi"
};

const message2 = {
  from_username: "Justin",
  to_username: "Dave",
  body: "Hi"
};

const message3 = {
  from_username: "Dave",
  to_username: "Justin",
  body: "Hi"
};

async function seedDatabase() {

  await User.register(user1);
  await User.register(user2);
  await User.register(user3);

  await Message.create(message1);
  await Message.create(message2);
  await Message.create(message3);
}

seedDatabase();