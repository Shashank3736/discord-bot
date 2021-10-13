const fetch = require('node-fetch');

export async function clean (text: any): Promise<string> {
    if (text && text.constructor.name === 'Promise') text = await text
    if (typeof text !== 'string') text = require('util').inspect(text, { depth: 1 })
  
    text = text.replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(process.env.TOKEN, '<TOKEN>');
  
    return text;
}

export function hastebin (input: any, extension?: string): Promise<string> {
    return new Promise(function (resolve, reject) {
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!input) reject('[Error] Missing Input')
      fetch('https://hastebin.com/documents', {
        method: 'POST',
        body: input
      }).then(res => res.json())
        .then(body => {
          resolve('https://hastebin.com/' + body.key + ((extension) ? '.' + extension : ''))
        }).catch(e => reject(e))
    });
}

export function log(message: any) {
  if(process.env.DEBUG) console.log(message);
};