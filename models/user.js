"use strict";
const bcrypt = require("bcrypt");
const { NotFoundError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
        password,
        first_name,
         last_name,
         phone,
         join_at,
         last_login_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];

  }

  /** Authenticate: is username/password valid? Returns boolean. */
  // MUST RETURN BOOLEAN
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
         FROM users
         WHERE username = $1`,
      [username]);
    const user = result.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }

    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username`,
      [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError();
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users`

    );
    return results.rows;

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
      first_name,
      last_name,
      phone,
      join_at,
      last_login_at
      FROM users
      WHERE username = $1`,
      [username]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError();

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT m.id,
      m.to_username,
      m.body,
      m.sent_at,
      m.read_at,
      u.username,
      u.first_name,
      u.last_name,
      u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );

    return results.rows.map(r => r = {
      id: r.id,
      body: r.body,
      read_at: r.read_at,
      sent_at: r.sent_at,
      to_user: {
        first_name: r.first_name,
        last_name: r.last_name,
        username: r.username,
        phone: r.phone
      },

    });

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    // EACH SELECT COLUMN SHOULD HAVE OWN LINE
    const results = await db.query(
      `SELECT m.id,
      m.from_username,
      m.body,
      m.sent_at,
      m.read_at,
      u.username,
      u.first_name,
      u.last_name,
      u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.from_username = u.username
      WHERE m.to_username = $1`,
      [username]
    );

    return results.rows.map(r => r = {
      id: r.id,
      body: r.body,
      read_at: r.read_at,
      sent_at: r.sent_at,
      from_user: {
        first_name: r.first_name,
        last_name: r.last_name,
        username: r.username,
        phone: r.phone
      },

    });

  }
}

module.exports = User;
