import { Tarea, type DatosTarea } from './task.model';

export const repositorioTareas = {
  buscarTodas: () => Tarea.find().lean().exec(),
  buscarPorId: (id: string) => Tarea.findById(id).lean().exec(),
  crear: (datos: DatosTarea) => Tarea.create(datos),
  actualizar: (id: string, datos: DatosTarea) =>
    Tarea.findByIdAndUpdate(id, { $set: datos }, { returnDocument: 'after', runValidators: true }).exec(),
  eliminar: (id: string) => Tarea.findByIdAndDelete(id).exec(),
};
