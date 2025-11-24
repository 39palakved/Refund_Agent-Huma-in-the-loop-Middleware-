import * as z from  'zod'
import { createAgent, humanInTheLoopMiddleware, tool } from 'langchain'
import { ChatGroq } from "@langchain/groq"
import {Command, MemorySaver} from '@langchain/langgraph'
import { threadId } from 'worker_threads';
import { push } from 'langchain/hub';
import readline from 'node:readline/promises'
import { stdin } from 'node:process';
const gmailEmails = {
  messages: [
    {
      id: '18c3f2a1b5d6e789',
      threadId: '18c3f2a1b5d6e789',
      labelIds: ['INBOX', 'UNREAD'],
      snippet: "Hi, I purchased your JavaScript masterclass course last week but I would like to request a refund. The course content doesn't match what was advertised...",
      payload: {
        headers: [
          { name: 'From', value: 'john.doe@example.com' },
          { name: 'To', value: 'support@codersgyan.com' },
          { name: 'Subject', value: 'Refund Request - JavaScript Course' },
          { name: 'Date', value: 'Mon, 4 Nov 2024 10:30:00 +0000' }
        ],
        body: { data: 'SGksIEkgcHVyY2hhc2VkIHlvdXIgamF2YXNjcmlwdCBjb3Vyc2UgbGFzdCB3ZWVrIGFuZCB3b3VsZCBsaWtlIHRvIHJlcXVlc3QgYSByZWZ1bmQu' } // base64 (sample)
      },
      internalDate: '1720031400000'
    },

    {
      id: '18c3e8f9a2c4b567',
      threadId: '18c3e8f9a2c4b567',
      labelIds: ['INBOX'],
      snippet: "Thank you for your recent purchase! Your order #CR-2024-1543 has been confirmed. We hope you enjoy the React Advanced Patterns course...",
      payload: {
        headers: [
          { name: 'From', value: 'noreply@codersgyan.com' },
          { name: 'To', value: 'sarah.williams@example.com' },
          { name: 'Subject', value: 'Order Confirmation - React Course' },
          { name: 'Date', value: 'Sun, 3 Nov 2024 14:20:00 +0000' }
        ],
        body: { data: 'VGhhbmtzIGZvciB5b3VyIGNvbW1pdG1lbnQhIFlvdXIgb3JkZXIgaXMgbm93IGNvbmZpcm1lZC4=' }
      },
      internalDate: '1720009200000'
    },

    {
      id: '28d4a1b7c9e6f001',
      threadId: '28d4a1b7c9e6f001',
      labelIds: ['INBOX', 'UNREAD'],
      snippet: "Hello — I'm not satisfied with the course modules. Please advise how I can get a refund or a partial refund for the purchase made on 29 Oct.",
      payload: {
        headers: [
          { name: 'From', value: 'misha.patel@example.co' },
          { name: 'To', value: 'billing@codersgyan.com' },
          { name: 'Subject', value: 'Request: Refund / Partial Refund' },
          { name: 'Date', value: 'Tue, 5 Nov 2024 08:45:00 +0000' }
        ],
        body: { data: 'SSdtIGF2YWlsYWJsZSB0byBnaXZlIG1vcmUgaW5mb3JtYXRpb24gd28u' }
      },
      internalDate: '1720112700000'
    },

    {
      id: '38f5b2c8d0a9e112',
      threadId: '38f5b2c8d0a9e112',
      labelIds: ['INBOX'],
      snippet: "Your subscription has been renewed successfully. Thank you for staying with us — enjoy the new content!",
      payload: {
        headers: [
          { name: 'From', value: 'subscriptions@codersgyan.com' },
          { name: 'To', value: 'customer@example.com' },
          { name: 'Subject', value: 'Subscription Renewal Successful' },
          { name: 'Date', value: 'Wed, 6 Nov 2024 06:00:00 +0000' }
        ],
        body: { data: 'WW91ciBzdWJzY3JpcHRpb24gaGFzIGJlZW4gcmVuZXdlZC4gVGhhbmsgeW91IQ==' }
      },
      internalDate: '1720197600000'
    },

    {
      id: '48a6c3d9e1b2f223',
      threadId: '48a6c3d9e1b2f223',
      labelIds: ['INBOX', 'UNREAD'],
      snippet: "Hi support, I completed only 2/10 modules and many videos are missing. I want my money back.",
      payload: {
        headers: [
          { name: 'From', value: 'raj.kumar@example.in' },
          { name: 'To', value: 'support@codersgyan.com' },
          { name: 'Subject', value: 'Refund needed - incomplete course' },
          { name: 'Date', value: 'Thu, 7 Nov 2024 12:15:00 +0000' }
        ],
        body: { data: 'TWFueSB2aWRlb3MgYXJlIG1pc3NpbmcgYW5kIEkgZG8gbm90IHNlZSB0aGUgc3R1ZmY=' }
      },
      internalDate: '1720286100000'
    },

    {
      id: '58b7d4eaf2c3d334',
      threadId: '58b7d4eaf2c3d334',
      labelIds: ['INBOX'],
      snippet: "Thanks for the amazing course — learned a lot. Would recommend to friends!",
      payload: {
        headers: [
          { name: 'From', value: 'happy.student@example.com' },
          { name: 'To', value: 'team@codersgyan.com' },
          { name: 'Subject', value: 'Thank you — React Patterns' },
          { name: 'Date', value: 'Fri, 8 Nov 2024 18:00:00 +0000' }
        ],
        body: { data: 'SGFwcHkgdG8gaGVscCB3aXRoIG15IGNvZHVlLCB0aGFua3MgZm9yIHRoZSBncmVhdCBjb250ZW50Lg==' }
      },
      internalDate: '1720380000000'
    },

    {
      id: '68c8e5fb0344a445',
      threadId: '68c8e5fb0344a445',
      labelIds: ['INBOX', 'PROMOTIONS'],
      snippet: "Black Friday sale: 50% off all courses this weekend only. Limited seats for live mentorship.",
      payload: {
        headers: [
          { name: 'From', value: 'offers@codersgyan.com' },
          { name: 'To', value: 'subscriber@example.com' },
          { name: 'Subject', value: 'Black Friday — 50% OFF Courses' },
          { name: 'Date', value: 'Sat, 9 Nov 2024 07:30:00 +0000' }
        ],
        body: { data: 'U2F2ZSBob3cgbXVjaCB5b3UgY2FuIGhlbHAgd2l0aCB5b3VyIGNvdXJzZS4=' }
      },
      internalDate: '1720463400000'
    }

  ],
 resultSizeEstimate: 5,
};


const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})
const getEmails = tool(()=>{
    //too : fetch email from gmail api here we are taking from fake api
return gmailEmails;
},{
   name:"get_emails",
   description:'Get the emails from inbox '
}) 
const refund= tool(({emails})=>{
  return "All refunds processed successfully"
},{
 name:"refund",
 description:"Process the refund for given emails",
 schema:z.object({
    emails:z.array(z.string()).describe("The list of the emails which need to be refunded")
 })
}) 
const agent = createAgent({
    model: llm,
    tools:[getEmails,refund],
   
    middleware: [ 
    humanInTheLoopMiddleware({ 
      interruptOn: { refund: true }, 
      descriptionPrefix: "Refund Pending Approval ", 
    }), 
  ], 
  checkpointer: new MemorySaver(),
});
 async function main(){
    const rl = readline.createInterface({input:process.stdin , output:process.stdout})
    let interrupts = []
    
    while(true){
        const query = await rl.question("You: ")
        if(query === '/bye'){
            break;
        }

        const response = await agent.invoke(
            interrupts.length 
            ?
            new Command({resume: {
                [interrupts?.[0]?.id]:{
                    decisions :[{type: query === '1'? 'approve' : 'reject'}]
                }
            }})
    :{
        messages:[
            {role:'user',
              content:query
            }
            
        ]
    },
    {
        configurable:{thread_id: '1'}
    }
);
      interrupts =[];
      let output = ""
    if(response?.__interrupt__?.length){
interrupts.push(response.__interrupt__[0])
output +=  response.__interrupt__[0].value.actionRequests[0].description + "\n\n"
output += "Choose:\n"
output += response.__interrupt__[0].value.reviewConfigs[0].allowedDecisions.filter((decision=> decision !== 'edit')).map((decision,idx)=>
    `${idx +1}. ${decision}`
).join("\n");

}
else{
    output += response.messages[response.messages.length-1].content
}
console.log(output);
    }
    rl.close();
}
main();
 

