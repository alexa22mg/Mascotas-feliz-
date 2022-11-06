import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Usuario } from '../models';
import { UsuarioRepository } from '../repositories';
import { Llaves } from '../config/llaves';
const generador =require('password-generator');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// se crea dentro del metodo constructor la intyecciones de parametros 
// se intecta los repositorios y importa los repositorios.
// se intala en la terminal jsonwebtoken
@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository
  ){}
  // se crea metodo para generar clave
  GenerarClave(){
    let Clave = generador(8, false);
    return Clave;
  }
  // se crea metodo para incriptar la clave 
  CifrarClave(Clave:string){
    let ClaveCifrada = cryptoJS.MD5(Clave);
    return ClaveCifrada;
  }
  // se crea un nuevo metodo para realizar la busqueda del usuario en el sistema 
  IdentificarPersona(usuarios:string, Clave: string){
    try {
      let p = this.usuarioRepository.findOne({where:{Correo: usuarios,Contrasena:Clave}});
      if(p){
        return p;
      }
      return false;
      
    } catch {
      return false;
    }
  }
// se genera metodo para autenticar usuario y se importa jwt token. se crea carpeta config. y se importa las llaves
  GenerarTokenJWT(usuario:Usuario){
    let token = jwt.sign({
      data:{
        id: usuario.id,
        correo: usuario.Correo,
        nombre: usuario.Nombre,
        apellido: usuario.Apellido,
        rol: usuario.Rol
      } 
    },
    Llaves.claveJWT);
    return token;    
  }
  // se gerar metodo  validacion de token
  ValidarTokenJWT(token:string){
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;
      
    }
  }
}
