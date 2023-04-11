"use strict";
process.env.NODE_ENV = "test";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");
const request = require("supertest");
const db = require("../db");
const { UnauthorizedError, BadRequestError } = require("../expressError");

let testUserToken;

beforeEach(async function () {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  let u = await User.register({
    username: "test",
    password: "password",
    first_name: "Test",
    last_name: "Testy",
    phone: "+14155550000",
  });

  testUserToken = jwt.sign(u.username, SECRET_KEY);

});

describe("GET /", function () {
  test("returns all users if logged in", async function () {
    const response = await request(app)
      .get(`/users/`)
      .send({ _token: testUserToken });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      "users": [
        {
          "username": "test",
          "first_name": "Test",
          "last_name": "Testy"
        }
      ]
    });
  });

  test("throws error if user not logged in", async function() {
    const response = await request(app)
      .get(`/users/`);
    expect(response.statusCode).toEqual(401);
  })


});