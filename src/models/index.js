const Emailcode=require("./Emailcode");
const User=require("./User");

Emailcode.belongsTo(User)
User.hasOne(Emailcode);
