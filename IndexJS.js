const posts = Vue.createApp({
    data(){
        return{
            tituloPost : "Recorte de personal urgente",
            usuario: "Doctor Mariano Casas",
            mensaje: "Actualmente los casos clínicos no son considerados como una fuente óptima de conocimiento científico, porque pueden ser subjetivas y carecer de control, por lo que en la práctica clínica no se recomienda tomar decisiones teniendo como evidencia reporte de casos, puesto que no representan la jerarquía de estudios prospectivos, aleatorios, etc",
    };
    },
});

const postsAPI = Vue.createApp({
    data(){
        return{
            post:[],
            comentarioNuevo:"",
            idComentariosNuevos: 501,

        };
    },
    mounted(){
        fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => {
            return response.json();
        })
        .then(data =>{
            data.forEach(element =>{
                fetch('https://jsonplaceholder.typicode.com/users/'+element.userId)
            .then(response => {
                return response.json();
             }).then(data => {
                let usuario = data;
                let nuevoPost = 
                {
                    userId: element.userId,
                    name:usuario.username,
                    id: element.id,
                    title: element.title,
                    body: element.body,
                    comentarios:[]
                }
                this.post.push(nuevoPost); 
             })
            })
        });
    },
    methods:{
        //CARGAR LOS COMENTARIOS DE UNA PUBLICACIÓN
        rerender(event,id){
            this.post.forEach(element => {
                if(element.id == id){
                    if(event.currentTarget.id=="1"){
                        event.currentTarget.id="2";
                        event.currentTarget.text="Ocultar los comentarios";
                        fetch('https://jsonplaceholder.typicode.com/posts/'+element.id+'/comments')
                            .then(response => {
                                return response.json();
                        })
                            .then(data =>{
                                data.forEach(comentarioAPI => {
                                    let comentario = 
                                    {
                                        postId: comentarioAPI.postId,
                                        id: comentarioAPI.id,
                                        name: comentarioAPI.name,
                                        email: comentarioAPI.email,
                                        body: comentarioAPI.body
                                    }
                                    element.comentarios.push(comentario);
                                });
                            });
                    }
                    else
                    {
                        event.currentTarget.id="1";
                        event.currentTarget.text="Ver todos los comentarios";
                        element.comentarios = [];
                    }
                }
                
            });
        },
        //DELETE A UN COMENTARIO
        //LOS COMENTARIOS SE ELIMINAN Y SE BORRAN DE LA INTERFAZ, PERO AL NO SER ELIMINADOS DE LA BD, VUELVEN A MOSTRARSE CUANDO SE HACE UN NUEVO GET
        deleteCommentario(Post,idComentario){
            fetch('https://jsonplaceholder.typicode.com/comments/'+idComentario, {
                method: 'DELETE',
            }).then(response => {
                console.log('Comentario '+idComentario+' eliminado correctamente\n'+response.status);
                this.post.forEach(element => {
                    if(element.id == Post){
                        element.comentarios.forEach(data => {
                            if(data.id == idComentario){
                                const indexComentario = element.comentarios.indexOf(data);
                                element.comentarios.splice(indexComentario,1);
                            }
                        })
                    }
                });
        });
        },
        //PUT A COMENTARIO
        //LA ACTUALIZACIÓN SE REALIZA Y SE MUESTRA EN LA INTERFAZ, PERO COMO NO SE GUARDA EN LA BD, NO APARECE AL VOLVER A HACER UN FETCH DE LOS COMENTARIOS DE LA API
        putComentario(event,comentario){
            const editando = document.getElementById('comentario-'+comentario.id);
            console.log(event.currentTarget.id);
            if(event.currentTarget.id=="editarComentario-"+comentario.id+"-1"){
                event.currentTarget.src="IMG/save.png";
                editando.contentEditable="true";
                editando.focus();
                event.currentTarget.id="editarComentario-"+comentario.id+"-2";
            }
            else{
                fetch('https://jsonplaceholder.typicode.com/posts/1', {
                    method: 'PUT',
                    body: JSON.stringify({
                    id: comentario.id,
                    title: 'testComentario',
                    body: editando.innerText,
                    userId: 'testUsuarioId',
                }),
                    headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
                .then((response) => response.json())
                    .then((json) => console.log(json));
                        event.currentTarget.src="IMG/edit.png";
                        event.currentTarget.id="editarComentario-"+comentario.id+"-1";
                        editando.contentEditable="false";
            }
        },
        //POST DEL COMENTARIO
        postComentario(Post){
            const textoComentario = document.getElementById('nuevoComentario-'+Post);
            this.post.forEach(element => {
                if(element.id == Post){
                        fetch('https://jsonplaceholder.typicode.com/comments',{
                            method: 'POST',
                            body: JSON.stringify({
                                postId: Post,
                                name: 'userTest',
                                id: this.idComentariosNuevos,
                                email: 'test@gmail.com',
                                body: textoComentario.value
                            }),
                            headers:{
                                'Content-type': 'application/json; charset=UTF-8'
                            },
                        })
                            .then(response => {
                                return response.json();
                        })  
                        //LOS COMENTARIOS NUEVOS NO SE GUARDAN EN LA BASE DE DATOS, POR LO QUE EL SIGUIENTE CÓDIGO ES SIMPLEMENTE PARA MOSTRARLOS EN LA INTERFAZ AL POSTEAR
                        const nuevo = {
                                postId: Post,
                                id:  this.idComentariosNuevos,
                                name: 'userTest',
                                email: 'test@gmail.com',
                                body: textoComentario.value
                        }
                        this.idComentariosNuevos++;
                            let temp = element.comentarios;
                            element.comentarios=[];
                            element.comentarios.push(nuevo);
                            temp.forEach(comentariosPrevios => {
                                let comentario = 
                                {
                                    postId: comentariosPrevios.postId,
                                    id: comentariosPrevios.id,
                                    name: comentariosPrevios.name,
                                    email: comentariosPrevios.email,
                                    body: comentariosPrevios.body
                                }
                                element.comentarios.push(comentario);
                            });      
                        }               
                });
        },
        ajustarCajaTexto(event){
            event.currentTarget.style.height = "1px";
            event.currentTarget.style.height = (5+event.currentTarget.scrollHeight)+"px";
        }
    }
});

posts.mount('#PostContainers');
postsAPI.mount('#PostApi');