const {getAllUsers, blockUnblock, deleteUser } = require("../../helpers/user/users");

module.exports = {
  display_users: function (req, res, next) {
    res.render("admin/display_users", { admin: true });
  },
  get_users : function (req,res) {
    getAllUsers().then((users) =>{
      res.render("admin/view_users",{users : users,admin:true})
    })
  },
  add_user: function (req, res, next) {
    res.render("admin/add_users");
  },
  getBlockUser: (req, res) => {
    blockUnblock(req.params.id).then((status) => {
      if(status) {
        res.redirect("/admin/users");
      } else {
        
      }
    })
  },
  getdeleteUser: (req, res) => {
    deleteUser(req.params.id).then((done) => {
      if (done) {
        res.redirect("/admin/users");
      } else {
        res.send("some error occured");
      }
    });
  },
};
 