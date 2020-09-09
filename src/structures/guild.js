const { Structures } = require("discord.js");
const quickdb = require("quick.db");
const db = new quickdb.table("Guild")
Structures.extend("Guild", Guild => {
    class GuildExt extends Guild{
        constructor(...args) {
            super(...args)
            if(!db.has(`_${this.id}`)) {
                db.set(`_${this.id}`, {})
            }
        }
        /**
         * Get database value of the guild.
         * @param {string} key Path to the value you want.
         * @param {any} value Fallback value.
         */
        get(key, value) {
            return db.get(`_${this.id}.${key}`) || value;
        } 
        /**
         * All data of the guild. If null returns {};
         */
        all() {
            return db.get(`_${this.id}`) || {};
        }
        /**
         * Set data for the guild.
         * @param {string} key 
         * @param {any} value 
         */
        set(key, value) {
            return db.set(`_${this.id}.${key}`, value);
        }
        /**
         * Delete some data's from the guild.
         * @param {string} key 
         */
        remove(key) {
            return db.delete(`_${this.id}.${key}`);
        }
        /**
         * Add or substract some values from the data.
         * @param {string} key 
         * @param {number} number 
         */
        add(key, number) {
            return db.add(`_${this.id}.${key}`, number);
        }
        /**
         * Push data into an array [].
         * @param {string} key 
         * @param {any} value 
         */
        push(key, value) {
            return db.push(`_${this.id}.${key}`, value)
        }
        /**
         * Remove an specific element from an array.
         * @param {string} key 
         * @param {any} value 
         */
        pull(key, value) {
            const old = this.get(key);
            if(!old || !Array.isArray(old)) throw new Error("Data do not exist or data is not an array: "+old);
            const New = old.filter(e => e !== value);
            return this.set(key, New);
        }
    }
    return GuildExt;
});