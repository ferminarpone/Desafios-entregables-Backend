import passport from "passport";
import passportLocal from "passport-local";
import GitHubStrategy from 'passport-github2';
import jwt from 'passport-jwt';
import userDao from "../dao/dbManager/user.dao.js";
import { PRIVATE_KEY, createHash, isValidPassword } from "../utils.js";

//Declaración de estrategia
 const localStrategy = passportLocal.Strategy;

const JwtStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

  //Register
  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const exist = await userDao.getUser({ email: username });
          if (exist) {
            console.log("El usuario ya existe");
            return done(null, false);
          } 
          const user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            loggedBy: "Registro Local"
          };
          const newUser = await userDao.createUser(user);
          return done(null, newUser);
        } catch (error) {
            return done("Error registrando al usuario " + error);
        }
      }
    )
  );
/* LOCAL STRATEGY
  //Login
  passport.use(
    "login",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const user = await userDao.getUser({ email: username });
          if (!user) {
            console.warn("No existe ningun usuario con email: " + username);
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            console.warn("Credenciales invalidas para el usuario: " + username);
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  */

  //Login con Github
  passport.use('github', new GitHubStrategy({
    clientID:'Iv1.9b96bb06921fd9d6',
    clientSecret:'79982a709b54f8006b6f218faac8a09f3c24129a',
    callbackUrl: 'http://localhost:8080/api/sessions/githubcallback'
  }, async (accesToken, refreshToken, profile, done)=> {
    console.log("Profile obtenido del usuario de GitHub");
    console.log(profile);
    try {
      const user = await userDao.getUser({ email: profile._json.email });
      if(!user){
        let newUser = {
          first_name: profile._json.name,
          last_name: '',
          age: 28,
          email: profile._json.email,
          password: '',
          loggedBy: "GitHub"
        };
        const result = await userDao.createUser(newUser);
        return done(null, result)
      }else{
        return done(null, user)
      }
    } catch (error) {
      return done(error)
    }
  })) 

  //JWT STRATEGY
  passport.use('jwt', new JwtStrategy(
    {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
    }, async (jwt_payload, done) => {
        console.log("Entrando a passport Strategy con JWT.");
        try {
            console.log("JWT obtenido del Payload");
            console.log(jwt_payload);
            return done(null, jwt_payload.user)
        } catch (error) {
            return done(error)
        }
    }
))

  //Serialización y Deserialización
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userDao.getUserById(id);
      done(null, user);
    } catch (error) {
      console.error("Error deserializando el usuario: " + error);
    }
  });

};

const cookieExtractor = req => {
  let token = null;
  console.log("Entrando a Cookie Extractor");
  console.log(req.cookies);
  if (req && req.cookies) {//Validamos que exista el request y las cookies.
      console.log("Cookies presentes: ");
      console.log(req.cookies);
      token = req.cookies['jwtCookieToken']
      console.log("Token obtenido desde Cookie:");
      console.log(token);
  }
  return token;
};

export default initializePassport;
