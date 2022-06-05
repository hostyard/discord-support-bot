require("dotenv").config()
const { Client, Intents } = require("discord.js")
const ReadText = require('text-from-image')
const errors = require('./errors.json')
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

client.on("ready", () => {
    console.log("I am ready!")
    client.user.setPresence({
        activities: [{ 
          name: "👀",
          type: "WATCHING"
        }],
        status: "dnd"
    })
})

client.on("messageCreate", (message) => {

    if (message.author.bot) {
        return
    }

    if (message.channel.parentId !== process.env.CATEGORY) {
        return
    }

    var image = message.attachments.first()

    if (image) {
        if (image.contentType !== "image/png" && image.contentType !== "image/jpg" && image.contentType !== "image/jpeg") {
            return
        }

        message.react('🧠')

        ReadText(image.proxyURL).then(text => {
            solution(message, message.content + text)
        }).catch(error => {
            console.log(error)
        })

    } else {
        solution(message, message.content)
    }

})

function solution(message, content) {
    let answered = false

    content = content.toLowerCase()
    errors.map((problem) => {

        if (answered) {
            return
        }

        if (problem.question) {
            let sequence = []
    
            problem.question.map((word) => {
                var regex = new RegExp('\\b' + word.toLowerCase() + '\\b')
                sequence.push(content.search(regex))
            })
    
            if (sequence.slice(1).every((e,i) => e > sequence[i])) {
                message.reply(problem.solution.replace('{author}', `<@${message.author.id}>`))
                answered = true
            }
        }

        if (problem.error) {
            if (content.includes(problem.error.toLowerCase())) {
                message.reply(problem.solution.replace('{author}', `<@${message.author.id}>`))
                answered = true
            }
        }

    })
}

client.login(process.env.TOKEN)