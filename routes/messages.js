"use strict";

const Router = require("express").Router;
const router = new Router();
const { UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    const message = await Message.get(req.params.id);
    const currentUser = res.locals.user.username;

    if (message.to_user.username !== currentUser &&
        message.from_user.username !== currentUser) {
        throw new UnauthorizedError("Can only read messages sent or received by you");
    }

    return res.json({ message });


});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
    const message = await Message.create({
        from_username: res.locals.user.username,
        to_username: req.body.to_username,
        body: req.body.body

    });

    return res.json({ message });
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    const message = await Message.get(req.params.id);
    const currentUser = res.locals.user.username;

    if (message.to_user.username !== currentUser) {
        throw new UnauthorizedError("Only recipients can mark message as read");
    }

    const readMessage = await Message.markRead(req.params.id);
    return res.json({ readMessage }); //return obj
})

module.exports = router;