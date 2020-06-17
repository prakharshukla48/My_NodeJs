const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validatorResult, validationResult } = require('express-validator/check');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {email: '', password: ''},
    validationError: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {email: "", password: "", confirmPassword: ""},
    validationError: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password},
      validationError: errors.array()
    });
  }

  User.findOne({email: email})
    .then(user => {
        if (!user) {
          req.flash('error', 'Invalid Id or password!');
          return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            console.log('Hi');
            
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          else {
            req.flash('error', 'Invalid Id or password!');
          }
          res.redirect('/login');
      }).catch(err => {
        console.log(err);
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
      validationError: errors.array()
    });
  }

  
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();  
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'ayushsahu99@gmail.com',
        subject: 'Sign Up Completed',
        html: '<h1>you successfuly signed up!</h1>'
      })
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(12, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with this email found!');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now()+3600000;
      return user.save()
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'ayushsahu99@gmail.com',
        subject: 'password reset',
        html: `
          <p>you registered password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</p>
        `
      });
    })
    .catch(err => console.log('Error1', err))
    .catch(err => console.log('Error2', err))
  })
};

exports.getNewPassword = (req, res, next) => {
  
  const token = req.params.token;
  User.findOne({resetToken: token,
  resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    if (!user) {
      req.flash('error', 'Cant find the token ');
      console.log(token)
      return res.redirect('/reset');
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => console.log('Not found: ',err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => console.log('Error during saving!', err))
  .catch(err => console.log('Error during password hashing', err))
  .catch(err => console.log('Error during User finding!', err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
