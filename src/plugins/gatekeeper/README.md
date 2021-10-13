# Gatekeeper
Guardian comes with an awesome verification system made to separate self bots from genuine members. As we all know, **Discord is against bots that blatantly kick new accounts**. But, we also hate raiders and usually bad users joining your server and spamming mentions/text everywhere. This is where the verification comes in handy. 

This is how **Guardian** verifies someone:
* A user *Retard#6969* join your server.
* Guardian adds a role *Unverified* on user which remove his access to see other channel except `#verify`.
* *Retard#6969* will receive a captcha from Guardian.
* If user solved the captcha he will get access to other channel. Otherwise he will receive the action set by you.
* Captcha will keep regenerating after 12s. To avoid any other scripts which this user may use.

## Commands
Commands available in this module.

### Verification

- name: verification
- description: Command to setup verification system in your server.

You can customise complete verification system using this command like status, action and duration.

#### Status
Enable or disable verification system in your server.

- name: status
- type: Boolean option
- usage: 
    - /verification `status:` TRUE (To enable verification system)
    - /verificatuon `status:` FALSE (To disable verification system)

#### Action
If you want to change the action Guardian goes for once the user fails verification, follow the format "/verification `action:` [Quarantine/kick/ban]".

- name: action
- type: Integer
- usage: /verification `action:` Quarantine (To leave member in the verification channel.)