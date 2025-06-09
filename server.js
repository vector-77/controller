const net = require('net');
const { spawn } = require('child_process');


const clients = new Map(); // userId -> socket
let clientarr = [];

const server = net.createServer((socket) => {
  let userId = null;

  //socket.write('Enter your userId:\n');

  let targetId = "controller";
  socket.on('data', (data) => {
    const input = data.toString().trim();
    // First message: register userId
    if (!userId) {
      if (clients.has(input)) {
        socket.write('[!] This userId is already taken. Try again:\n');
        return;
      }
      userId = input;
      clients.set(userId, socket);
      clientarr.push(userId);
      socket.write(`✅ ${userId} connected`);
      console.log(`[+] ${userId} connected`);
      return;
    }

    // Handle commands
    if (input === 'list') {
      const list = clientarr.filter(id => id !== userId).map((id, index)=>{return `${index} : ${id}`}).join('\n') || 'No other users online.';
      socket.write(`[👥] Online users:\n-----------------------\n${list}\n`);
      return;
    }
    if(userId == "controller"){

        if (input.indexOf('item:')==0){
            const targetuId = input.split(':')[1];
            const list = clientarr.filter(id => id !== userId);
            targetId = list[targetuId]
            console.log(targetuId,targetId)
        }
        else{
            const targetSocket = clients.get(targetId);
            
            if (targetSocket) {
                console.log(input)
                targetSocket.write(`${input}\n`);
            } else {
                socket.write(`[!] User ${targetId} is not online.\n`);
            }

        }
    }
    else {
        targetId ="controller";
        const targetSocket = clients.get(targetId);
        if (targetSocket) {
            targetSocket.write(`${input}\n`);
        } else {
            //socket.write(`[!] User ${targetId} is not online.\n`);
        }
    }

  });

  socket.on('close', () => {
    if (userId) {
      clients.delete(userId);
      clientarr = clientarr.filter(id => id!=userId);
      console.log(`[-] ${userId} disconnected`);
    }
  });

  socket.on('error', (err) => {
    console.error(`[!] Error from ${userId}:`, err.message);
  });
});

server.listen(4000, () => {
  console.log('🖧 TCP Chat Server running on port 4000');
});
