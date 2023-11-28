const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  console.log(req.body);
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      isStatus:false,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.login = async (req, res, next) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect username or password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect username or password", status: false });
    await User.updateOne({ username }, { $set: { isStatus: true } });
    const updatedUser = await User.findOne({ username });
    delete updatedUser.password;
    return res.json({ status: true, user:updatedUser });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    await User.updateOne({ username }, { $set: { isStatus: false } });
    const updatedUser = await User.findOne({ username });
    delete updatedUser.password;
    return res.json({ status: true, user:updatedUser });
  } catch (ex) {
    next(ex);
  }
};


module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet, 
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email", 
      "username", 
      "isStatus", 
      "avatarImage", 
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};