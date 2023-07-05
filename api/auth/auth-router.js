// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
const router = require('express').Router();
const userModel = require('../users/users-model');
const { usernameBostami, sifreGecerlimi, usernameVarmi } = require('./auth-middleware');
const bcrypt = require('bcryptjs');
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */
router.post('/register', usernameBostami, sifreGecerlimi, async (req,res,next) => {
   const { username } = req.body;
   try {
     const user = await userModel.ekle({ username: username, password: req.hashedPassword })
     res.status(201).json(user)
   } catch (error) {
      next(error)
   }
});

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */
  router.post('/login', usernameVarmi, (req,res,next) => {
    const { password } = req.body;
    try {
      if (req.user && bcrypt.compareSync(password, req.user.password)) {
        req.session.user = req.user;
        res.status(200).json({ message: `Hoşgeldin ${req.user.username}!`})
      } else {
        res.status(401).json({ "message": "Geçersiz kriter!"});
      }
    } catch (error) {
       next(error);
    }
 });
 
 

/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */
  router.get('/logout', (req,res,next) => {
   try {
    if (req.session && req.session.user) {
      req.session.destroy(error => {
        if(error) {
          next({ message: "Session silinirken hata oluştu"});
        } else {
          res.set('Set-Cookie', 'cikolatacips=; Path=/; Expires=Mon, 01 Jan 1970 11:33:31 GMT')
          res.json({"message": "Çıkış yapildi"})
        }
      })
    } else {
      res.json({ "message": "Oturum bulunamadı!"});
    }
   } catch (error) {
    next(error);
   }
    } 
 );
 
 
// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.
module.exports = router