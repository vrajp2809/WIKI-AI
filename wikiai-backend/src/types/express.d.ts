import { JwtPayload } from '../services/auth/token.service';
import { Persona } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      persona?: Persona;
    }
  }
}
