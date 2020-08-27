const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');
const User = require('../models/users');

const router = express.Router();

router.post('/task', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send();
    }
})

router.get('/task', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy) {
        const criteria = req.query.sortBy.split(':');
        sort[criteria[0]] = criteria[1] === 'asc' ? 1 : -1;
    }

    try {
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        const tasks = req.user.tasks;
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
    
})

router.get('/task/:id', auth, async (req, res) => {

    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner : req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const validate = Object.keys(req.body);
    const validator = ['description', 'completed'];

    const isValid = validate.every((valid) => {
        return validator.includes(valid);
    })

    if(!isValid) {
        return res.status(400).send({error : 'Invalid Update!'});
    }

    try {
        const task = await Task.findOne({_id, owner : req.user._id});
    
        if(!task){
            return res.status(404).send();
        }
        validate.forEach((update) => {
            task[update]=req.body[update];
        })
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }    

})

router.delete('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id, owner : req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }

})

module.exports = router;
