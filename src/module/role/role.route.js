import { Router } from 'express';
import {  createRole, deleteRoleById, getAllRoles, getRoleById, getRolesByDeptCat, updateRoleById } from './role.controller.js';

const roleRoute = Router();

roleRoute.post("/add", createRole);
roleRoute.get("/all", getAllRoles);
roleRoute.get("/bydeptcategory", getRolesByDeptCat);
roleRoute.get("/byid", getRoleById);
roleRoute.put("/update", updateRoleById);
roleRoute.delete("/delete", deleteRoleById);


export default roleRoute;