const express = require("express");
const route = new express.Router();
const Task = require("../src/models/task");
const User = require("../src/models/user");
const auth = require("../src/middleware/auth");
route.get("/tasks", auth, async (req, res) => {
  try {
    let sort={}
    if(req.query.sortBy){
      const parts=req.query.sortBy.split(":");
sort[parts[0]]=parts[1] === 'desc' ? -1 : 1;
    }
    if (!req.query.completed) {
      const tasks = await Task.find({ owner: req.user._id })
        .limit(parseInt(req.query.limit))
        .skip(parseInt(req.query.limit) * (parseInt(req.query.skip) - 1))
        .sort(sort);
      return res.send(tasks);
    }
    const tasks = await Task.find({
      owner: req.user._id,
      completed: req.query.completed,
    })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.limit) * (parseInt(req.query.skip) - 1)).sort(sort);
    //await req.user.populate('tasks')
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});
route.get("/tasks/:id", auth, async (req, res) => {
  let _id = req.params.id;
  try {
    //const task = await Task.findById(_id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("Not found");
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
 
});
route.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isAllowed) {
    return res.status(400).send();
  }
  try {
  
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
route.post("/tasks", auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send();
  }

});
route.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});
module.exports = route;
