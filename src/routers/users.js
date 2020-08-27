const express = require('express');
const User = require('../models/users');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/user', async (req, res) => {

    const user = new User(req.body);
    
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send()
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/user/me', auth, async (req, res) => {
    
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

router.patch('/user/me', auth, async (req, res) => {

    const validate = Object.keys(req.body);
    const validators = ['name', 'password', 'age', 'email'];
    const isValid = validate.every((valid) => {
        return validators.includes(valid);
    })
    if(!isValid){
        return res.status(400).send({error : 'Invalid Updates'});
    }
    try {
        validate.forEach((update) => {
            req.user[update] = req.body[update];
        })

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send();
    }
})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

module.exports = router;