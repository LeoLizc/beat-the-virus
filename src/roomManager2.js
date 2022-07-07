class Room {
    constructor(io,id) {
        this.io=io;
        this.id=`room${id}`;
        this.size=0;
        this.jugando=false;
    }

    someSocket(){
        let s;
        if(this.c1){
            s=this.c1;
            this.c1=null;
            return s;
        }else{
            s=this.c2;
            this.c2=null;
            return s;
        }
    }

    addSocket(socket){

        console.log('Socket se ha unido a: ',this.id);

        if(!this.c1){
            this.c1=socket;
            socket.emit('aPrincipal',0);
            console.log('como C1');
        }else if(!this.c2){
            this.c2=socket;
            socket.emit('aPrincipal',1);
            console.log('como C2');
        }
        this.size++;
        socket.join(this.id);
        socket.sala=this;
        socket.player={};
        socket.player.hp=3;
        socket.player.vacunas=0;
        socket.player.pos={x:10,y:4};

        return (this.size>=2);
    }

    close(){
        clearTimeout(this.temporizador);
        clearTimeout(this.cuenta);
        if(this.c1)this.c1.sala=null;
        if(this.c2)this.c2.sala=null;

        this.c1=null;
        this.c2=null;
    }

    terminar(){
        console.log('SE ACABÓ EL TIEMPO');
        if(this.c1.player.vacunas>this.c2.player.vacunas){
            this.c1.emit('victoria');
            this.c2.emit('derrota');
        }else if(this.c2.player.vacunas>this.c1.player.vacunas){
            this.c2.emit('victoria');
            this.c1.emit('derrota');
        }else{
            if(this.c1.player.hp>this.c2.player.hp){
                this.c1.emit('victoria');
                this.c2.emit('derrota');
            }else if(this.c2.player.hp>this.c1.player.hp){
                this.c2.emit('victoria');
                this.c1.emit('derrota');
            }else{
                this.io.to(this.id).emit('empate');
            }
        }
    }

    leave(socket){
        console.log('socket deja la sala, ',this.id);
        if(this.c1===socket){
            this.c1=null;
            this.size--;
        }else if(this.c2===socket){
            this.c2=null;
            this.size--;
        }

        socket.leave(this.id);

        if(this.jugando){
            socket.to(this.id).emit('victoria','abandono');
            console.log('alguien abandonó en medio del juego');
            clearTimeout(this.cuenta);
        }else{
            clearTimeout(this.temporizador);
        }
        return (this.size===0);
    }
}

module.exports = class RoomManager{
    constructor(io,cant) {
        this.io=io;
        this.cant=cant;
        this.cont=this.activeRooms=0;
        this.cola=[];
    }

    addSocket(socket){
        if(this.activeRooms<this.cant || this.sala){
            if(this.sala){
                this.sala.addSocket(socket);

                let sala=this.sala;

                this.io.to(sala.id).emit('iniciar',true);
                sala.temporizador=setTimeout(()=>{//DONDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
                    this.io.to(sala.id).emit('juego');
                    console.log(this.io.to(sala.id).allSockets());
                    sala.jugando=true;
                    console.log('Empieza la pachanga');

                    this.empezar(sala);
                    // console.log(io.to('principal').allSockets());
                }, 5000);

                this.sala=null;
            }else{
                this.sala=new Room(this.io, this.cont++);
                this.sala.addSocket(socket);
                this.activeRooms++;
                console.log(`Active Rooms: ${this.activeRooms}`);
            }

            this.escuchas(socket);

        }else{
            console.log('Sea a unido a la cola');
            this.cola.push(socket.id);
            socket.sala='cola';
        }
    }

    escuchas(socket){
        socket.on('vacuna',()=>{
            console.log('alguien consiguió vacuna');
            socket.player.vacunas++;
            socket.to(socket.sala.id).emit('upStatus',socket.player);
        });

        socket.on('virus',(status)=>{
            if(status){
                console.log('alguien se infectó');
                socket.player.hp--;
                socket.to(socket.sala.id).emit('upStatus',socket.player);
            }
            socket.to(socket.sala.id).emit('virus',status);
        });

        socket.on('mascara',(status)=>{
            socket.to(socket.sala.id).emit('mascara',status);
        });

        socket.once('Victoria',()=>{
            clearTimeout(socket.sala.cuenta);
            console.log('alguien ganó');
            socket.to(socket.sala.id).emit('derrota');
            // siguiente();
            this.terminar(socket.sala);
        });

        socket.once('Derrota',()=>{
            clearTimeout(socket.sala.cuenta);
            console.log('alguien perdió');
            socket.to(socket.sala.id).emit('victoria');
            // siguiente();
            this.terminar(socket.sala);
        });

        socket.on('upMovement',(data)=>{
            socket.to(socket.sala.id).emit('upMovement',data);
        });

        socket.on('downMovement',(data)=>{
            socket.to(socket.sala.id).emit('downMovement',data);
        });
    }

    terminar(sala){
        sala.close();
        this.activeRooms--;
        this.updateCola();
        this.updateCola();
        // delete sala;
    }

    empezar(sala){

        sala.temporizador=setTimeout(()=>{
            sala.terminar();
            this.terminar(sala);
        },180000);
    }

    updateCola(){
        if(this.cola.length>0 && (this.activeRooms<this.cant || this.sala)){
            let socket=this.io.sockets.sockets.get(this.cola.shift());
            if(this.sala){
                this.sala.addSocket(socket);

                let sala=this.sala;
                sala.temporizador=setTimeout(()=>{//DONDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
                    this.io.to(sala.id).emit('juego');
                    console.log(this.io.to(sala.id).allSockets());
                    sala.jugando=true;
                    console.log('Empieza la pachanga');

                    this.empezar(sala);
                    // console.log(io.to('principal').allSockets());
                }, 5000);

                this.sala=null;
            }else{
                this.sala=new Room(this.io, this.cont++);
                this.sala.addSocket(socket);
                this.activeRooms++;
            }
            return true;
        }else{
            return false;
        }
    }

    delSocket(socket){
        if(socket.sala==='cola'){
            this.cola.splice(this.cola.indexOf(socket.id));
        }else{
            if(socket.sala){
                let sala=socket.sala;
                sala.leave(socket);
                if(!sala.jugando){
                    if(sala.size===1){
                        if(this.sala && (this.sala!=sala)){
                            this.sala.addSocket(sala.someSocket());
                            sala.close();
                            this.activeRooms--;
                            let sala2=this.sala;
                            sala2.temporizador=setTimeout(()=>{//DONDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
                                this.io.to(sala2.id).emit('juego');
                                console.log(this.io.to(sala2.id).allSockets());
                                sala2.jugando=true;
                                console.log('Empieza la pachanga');

                                this.empezar(sala2);
                                // console.log(io.to('principal').allSockets());
                            }, 5000);

                            this.sala=null;
                        }else{
                            this.sala=sala;
                            if(!this.updateCola()){
                                this.io.to(sala.id).emit('iniciar',false);
                            }
                        }
                    }else{
                        delete this.sala;
                        this.activeRooms--;
                    }
                }else{
                    this.terminar(sala);
                }
            }else{
                console.log('alguien que terminó dejo la sala (parece)');
            }
        }
    }
}
