import { AuthenticationStrategy } from "@loopback/authentication";
import { Request, RedirectRoute } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { ParamsDictionary } from 
"express-serve-static-core";
import parseBearerToken from "parse-bearer-token";
import {HttpErrors} from '@loopback/rest';
import { ParsedQs } from "qs";
import { AutenticacionService } from "../services";
import { service } from "@loopback/core";
// se crea metodo para permisos de roles desde el administrador 
export class EstrategiaAdministrador implements AuthenticationStrategy{
    name: string = 'Admin';
   constructor(
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService

   ){}

    async authenticate(request: Request): Promise<UserProfile | undefined> {
        let token = parseBearerToken(request);
        if(token){
            let datos = this.servicioAutenticacion.ValidarTokenJWT(token)
            if(datos){
                let perfil:UserProfile = Object.assign({
                    nombre: datos.data.nombre
                });
                return perfil;
        }else{
            throw new HttpErrors[401]("No vino token ")
        }       
    }
}
}
