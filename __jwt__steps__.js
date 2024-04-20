/**
 * install jsonwebtoken
 * jwt.sign (payload, secret, {expriresIn:})
 *  send token client
 * 
 * 
 * */

/**
 * how to store in client side
 * 
 * 1. http cookie only
 * 2. local storage
 * 3. memory
 * 
 * 
 * */

/**
 * 1. set cookie with http only. for development secure: false
 * 2. cors
 * // cors setting:
    app.use(cors({
       origin: ['http://localhost:5173/'],
       credentials: true
    }));
 * 3. client side axios setting
    4. in axios set withCredials:
 *  */ 