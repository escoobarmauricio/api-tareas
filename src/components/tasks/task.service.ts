import { ErrorHttp } from '../../shared/http-error';
import { cuerpoObjeto, texto, validarId } from '../../shared/validation';
import type { DatosTarea } from './task.model';
import { repositorioTareas } from './task.repository';

function datosTarea(entrada: unknown, alCrear: boolean): DatosTarea {
  const cuerpo = cuerpoObjeto(entrada);
  const titulo = texto(cuerpo.title, 'title', 120);
  // Regla de negocio 1: solo existen estas tres prioridades.
  if (cuerpo.priority !== 'baja' && cuerpo.priority !== 'media' && cuerpo.priority !== 'alta') {
    throw new ErrorHttp(400, 'La prioridad debe ser baja, media o alta');
  }
  // La fecha es un día calendario UTC; se rechazan fechas como 2027-02-30.
  if (typeof cuerpo.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(cuerpo.dueDate)) {
    throw new ErrorHttp(400, 'dueDate debe tener formato YYYY-MM-DD');
  }
  const fechaLimite = new Date(`${cuerpo.dueDate}T00:00:00.000Z`);
  if (Number.isNaN(fechaLimite.getTime()) || fechaLimite.toISOString().slice(0, 10) !== cuerpo.dueDate) {
    throw new ErrorHttp(400, 'La fecha límite no es válida');
  }
  // Regla de negocio 2: al crear una tarea, su vencimiento no puede ser pasado.
  if (alCrear && cuerpo.dueDate < new Date().toISOString().slice(0, 10)) {
    throw new ErrorHttp(400, 'La fecha límite no puede ser anterior a hoy (UTC)');
  }
  const completada = alCrear && cuerpo.completed === undefined ? false : cuerpo.completed;
  if (typeof completada !== 'boolean') {
    throw new ErrorHttp(400, 'completed debe ser true o false');
  }
  return { title: titulo, priority: cuerpo.priority, dueDate: fechaLimite, completed: completada };
}

export const servicioTareas = {
  listar: () => repositorioTareas.buscarTodas(),

  async obtener(id: string) {
    validarId(id);
    const tarea = await repositorioTareas.buscarPorId(id);
    if (!tarea) throw new ErrorHttp(404, 'Tarea no encontrada');
    return tarea;
  },

  crear: (entrada: unknown) => repositorioTareas.crear(datosTarea(entrada, true)),

  async actualizar(id: string, entrada: unknown) {
    validarId(id);
    const tarea = await repositorioTareas.actualizar(id, datosTarea(entrada, false));
    if (!tarea) throw new ErrorHttp(404, 'Tarea no encontrada');
    return tarea;
  },

  async eliminar(id: string) {
    validarId(id);
    const tarea = await repositorioTareas.eliminar(id);
    if (!tarea) throw new ErrorHttp(404, 'Tarea no encontrada');
    return { message: 'Tarea eliminada' };
  },
};
