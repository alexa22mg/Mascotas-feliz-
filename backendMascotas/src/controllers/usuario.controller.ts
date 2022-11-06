import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  RestHttpErrors,
  HttpErrors,
} from '@loopback/rest';
import { Hash } from 'crypto';
import {Credenciales, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import { AutenticacionService } from '../services';
const fetch = require ('node-fetch');

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service(AutenticacionService)
    public ServicioAutenticacion : AutenticacionService
  ) {}
//se genera una ruta de identificacion por el metodo post
  @post('/identificarPersona',{
    responses:{
      '200':{
        description: 'identificacion de usuarios'
      }
    }
  })
  //  se crea una funcion asincronica que devuelve los datos de autenticacion el token asignado y se crea el modelo de credenciales.
  async identificarPersona(
    @requestBody() Credenciales:Credenciales
  ){
    let p = await this.ServicioAutenticacion.IdentificarPersona(Credenciales.usuario,Credenciales.Contrasena);
    if(p){
      let token = this.ServicioAutenticacion.GenerarTokenJWT(p);
      return {
        datos:{
          nombre: p.Nombre,
          apellido: p.Apellido,
          correo: p.Correo,
          id: p.id,
          rol: p.Rol
        },
        tk:token
      }
    }else{
      throw new HttpErrors[401]('Datos Invalidos');
    }
  }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
  //  se genero clave 
  //  se cifra la clave 
  //  se asigno una contraseña 
  //  se asigna un usuario y se crea la persona en repositorio usuario

  usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    let Clave = this.ServicioAutenticacion.GenerarClave();
    let ClaveCifrada = this.ServicioAutenticacion.CifrarClave(Clave);
    usuario.Contrasena = ClaveCifrada;
    let p = await this.usuarioRepository.create(usuario);

    // notificacion al usuario por medio de correo.
    let destino = usuario.Correo;
    let asunto = 'Registro en la plataforma';
    let contenido = ` hola ${usuario.Nombre} ${usuario.Apellido} Bienvenido a la plataforma de Mascotas Feliz su Usuario es ${usuario.Correo} y su contraseña es ${Clave} Gracias por comenzar hacer parte de nuestra familia`;
    fetch(`http://127.0.0.1:5000/email?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then((data:any)=>{
      console.log(data);
    })
    return p;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
}
