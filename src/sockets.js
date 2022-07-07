module.exports = async function (io){

    const LIMITESALAS=5;

    let roble=[[]];

    let enCola=[];
    let principal=[];
    let enJuego=false;
    let temporizador,cuenta;

    io.on('connection', async (socket)=>{
        console.log(`Se conectó un nuevo usuario : ${socket.id}`);
        let sala=elegirSala(socket);
        console.log('se conecta a la sala: ',sala);

        socket.on('disconnect', async ()=>{
            console.log(`el cliente ${socket.id} ha dejado la sala ${socket.sala}`);
            if(socket.sala==='cola'){
                enCola.splice(enCola.indexOf(socket.id),1);
            }else if(socket.sala === 'principal'){
                if(!enJuego){
                    clearTimeout(temporizador);
                    if(enCola.length>0){
                        let siguiente=enCola.shift();
                        principal.splice(principal.indexOf(socket.id),1,siguiente);
                        let nuevo = await io.sockets.sockets.get(siguiente);
                        nuevo.leave('cola');
                        console.log(`en su lugar se une: ${siguiente}`);
                        aPrincipal(nuevo);
                    }else{
                        principal.splice(principal.indexOf(socket.id),1);
                        io.to('principal').emit('iniciar',false);
                    }
                }else{
                    await clearTimeout(cuenta);
                    console.log('alguien abandonó en medio de un juego');
                    principal.splice(principal.indexOf(socket.id),1);
                    io.to('principal').emit('victoria','abandono');

                    terminar();
                }
            }
        });
    });

    async function terminar(){
        enJuego=false;

        // console.log('p',principal);
        for(let i=0; i<2 && principal.length>0;i++){
            // console.log('deja');
            let deja=await io.sockets.sockets.get(principal.shift());
            await deja.leave('principal');
            deja.sala='espera';
        }

        // console.log('p2',principal);

        for(let i=0; i<2 && enCola.length>0;i++){
            let siguiente=enCola.shift();
            principal.push(siguiente);
            let nuevo = io.sockets.sockets.get(siguiente);
            nuevo.leave('cola');
            console.log(`se unen a la sala principal: ${siguiente}`);
            aPrincipal(nuevo);
        }

    }

    function elegirSala(socket){
        if(principal.length >= 2){
            enCola.push(socket.id);
            socket.sala='cola';
            socket.join('cola');

            return 'cola';
        }else{
            principal.push(socket.id);
            aPrincipal(socket);


            return 'principal';
        }
    }

    async function aPrincipal(socket){
        await socket.join('principal');
        socket.sala='principal';

        socket.emit('aPrincipal',principal.indexOf(socket.id));

        socket.hp=3;
        socket.vacunas=0;

        escuchas(socket);

        if(principal.length === 2){
            io.to('principal').emit('iniciar',true);
            console.log('Inicia la cuenta regresiva');
            temporizador=setTimeout(()=>{
                io.to('principal').emit('juego');
                console.log(io.to('principal').allSockets());
                enJuego=true;
                console.log('Empieza la pachanga');

                empezar();
                // console.log(io.to('principal').allSockets());
            }, 5000);
        }
    }

    function empezar(){
        cuenta=setTimeout(()=>{
            const p1=io.sockets.sockets.get(principal[0]);
            const p2=io.sockets.sockets.get(principal[1]);

            console.log('SE ACABÓ EL TIEMPO');
            if(p1.vacunas>p2.vacunas){
                p1.emit('victoria');
                p2.emit('derrota');
            }else if(p2.vacunas>p1.vacunas){
                p2.emit('victoria');
                p1.emit('derrota');
            }else{
                if(p1.hp>p2.hp){
                    p1.emit('victoria');
                    p2.emit('derrota');
                }else if(p2.hp>p1.hp){
                    p2.emit('victoria');
                    p1.emit('derrota');
                }else{
                    io.to('principal').emit('empate');
                }
            }
        },180000);
    }

    function escuchas(socket){
        socket.on('vacuna',()=>{
            console.log('alguien consiguió vacuna');
            socket.vacunas++;
        });

        socket.on('virus',()=>{
            console.log('alguien se infectó');
            socket.hp--;
        });

        socket.on('Victoria',()=>{
            clearTimeout(cuenta);
            console.log('alguien ganó');
            socket.to('principal').emit('derrota');
            // siguiente();
            terminar();
        });

        socket.on('Derrota',()=>{
            clearTimeout(cuenta);
            console.log('alguien perdió');
            socket.to('principal').emit('victoria');
            // siguiente();
            terminar();
        });
    }
}
