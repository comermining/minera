'use strict'
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('sequelize');
const db = require('./../../models');
const html_to_pdf = require('html-pdf-node');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const workPermitModel = db.WorkPermitModel;
const workPermitEndWorkModel = db.WorkPermitEndWorkModel;
const workPermitMandatoryControlsModel = db.WorkPermitMandatoryControlsModel;
const workPermitProtectiveElementsModel = db.WorkPermitProtectiveElementsModel;
const workPermitStateModel = db.WorkPermitStateModel;
const workPermitTypesOfWorkModel = db.WorkPermitTypesOfWorkModel;
const workPermitApprovalPointModel = db.WorkPermitApprovalPointModel;
const areasModel = db.AreasModel;
const usersModel = db.UsersModel;
const userRolesModel = db.UserRolesModel;
const plantModel = db.PlantModel;
const plantPreventionistModel = db.PlantPreventionistModel;
const equipmentOrMachinesModel = db.EquipmentOrMachinesModel;
const contractorCompanyModel = db.ContractorCompanyModel;
const contractorCompanyExecutorModel = db.ContractorCompanyExecutorModel;
const typesOfWorkModel = db.TypesOfWorkModel;
const areaManagerModel = db.AreaManagerModel;
const protectiveElementsModel = db.ProtectiveElementsModel;
const mandatoryControlsModel = db.MandatoryControlsModel;
const endWorkModel = db.EndWorkModel;
const statesWorkPermitModel = db.StatesWorkPermitModel;
const environments = require('./../../environments/environment');

const i18n = require('./../../config/i18n');
const utilities = require('./../../utilities/functions');
const zeroPad = (new_code, places) => String(new_code).padStart(places, '0') 
const sendEmail = require('./../../config/connection-email');
const { StatesWorkPermitModel } = require('./../../models');
var QRCode = require('qrcode')

exports.getById = async (request, response) => {
	try {
		let id = request.params.id;
		let idUser = request.user.id;

		let data = await workPermitModel.findOne({			
			include: [				
				{
                    attributes: [
						'id', 'id_rol','names','sur_names', 'email'
                    ],
                    model: usersModel,
                    required: true
                },
                {
                    attributes: [
                        'id', 'name'
                    ],
                    model: plantModel,
                    required: true
                },		
                {
                    attributes: [
                        'id', 'name'
                    ],
                    model: areasModel,
                    required: true
                },
				{
                    attributes: [
						'id', 'id_area','name'
                    ],
                    model: equipmentOrMachinesModel,
                    required: true
                },
				{
					include: [				
						{
							attributes: [
								'id', 'id_rol','names','sur_names', 'email'
							],
							model: usersModel,
							required: true
						}
					],
                    attributes: [
						'id', 'id_area','id_user'
                    ],
                    model: areaManagerModel,
                    required: true
                },			
                {
                    attributes: [
						'id','name','direction','responsable_person','email'
                    ],
                    model: contractorCompanyModel,
                    required: true
                },	
				{
					include: [				
						{
							attributes: [
								'id', 'id_rol','names','sur_names', 'email'
							],
							model: usersModel,
							required: true
						}
					],
                    attributes: [
						'id', 'id_user'
                    ],
                    model: contractorCompanyExecutorModel,
                    required: true
                },
				{
					attributes: [
						'id', 'name'
					],
					model: statesWorkPermitModel,
					required: true
				},	
            ],
			attributes: [
				'id', 'id_user', 'id_plant', 'id_area', 'id_area_manager', 'id_equipment', 'id_contractor_company', 'id_work_executor', 'id_state', 'work_permit_code', 'date_start', 'date_end', 'time_start', 'time_end', 'work_description', 'number_people', 'number_cards', 'protective_elements_other', 'special_instructions','worked_days', 'days_not_worked' , 'work_days_description'
			],
			where: {
				id: id,
				status: '1'
			}
		});

		let dataTypesOfWork = await workPermitTypesOfWorkModel.findAll({					
			include: [
				{
					attributes: [
						'id', 'name'
					],
					model: typesOfWorkModel,
					required: true
				}
			],
			attributes: [
				'id', 'id_work_permit', 'id_type_of_work'
			],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});

		let dataProtectiveElements = await workPermitProtectiveElementsModel.findAll({					
			include: [
				{
					attributes: [
						'id', 'name'
					],
					model: protectiveElementsModel,
					required: true
				}
			],
			attributes: [
				'id', 'id_work_permit','id_protective_elements'
			],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});	

		let dataMandatoryControls = await workPermitMandatoryControlsModel.findAll({					
			include: [
				{
					attributes: [
						'id', 'name'
					],
					model: mandatoryControlsModel,
					required: true
				}
			],
			attributes: [
				'id', 'id_work_permit','id_mandatory_controls'
			],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});	

		let dataEndWork = await workPermitEndWorkModel.findAll({					
			include: [
				{
					attributes: [
						'id', 'name'
					],
					model: endWorkModel,
					required: true
				}
			],
			attributes: [
				'id', 'id_work_permit','id_end_work'
			],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});	
		
		let dataStates= await workPermitStateModel.findAll({					
			include: [
				{
					attributes: [
						'id', 'id_rol','names','sur_names', 'email'
					],
					model: usersModel,
					required: true
				}
			],
			attributes: [
				'id', 'id_work_permit', 'id_user', 'id_rol', 'status', 'date_state','token','justification','old_state'
			],
			where: {
				id_work_permit: id,
				status: '1'			
			}
		});	

		const { QueryTypes } = require('sequelize');
		let dataApprovalPoint = await db.sequelize.query(
			'Select wkap.id_work_permit_state, wkap.id_user, wkap.status, wkap.token, wkap.date_approval_point, u.`names`, u.sur_names, u.email, ar.`name` '
			+ ' from work_permit_state wps join work_permit_approval_point wkap on wkap.id_work_permit_state = wps.id '
			+ ' LEFT JOIN users u on wkap.id_user = u.id '
			+ ' left JOIN user_roles ar on u.id_rol = ar.id '
			+ ' where wps.id_work_permit = :id_wp '
			+ ' and wps.`status`=\'M\';', 
			{
				replacements: { id_wp: id },                    
				raw: true,
				type: QueryTypes.SELECT
			}
		);
				
		if (!data) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {
			
			//BOTONERA 
			let btt_aprobar = 0;
			let btt_rechazar = 0;
			let btt_modificar = 0;
			let secc_instrucciones_especiales = 0;
			let secc_termino_trabajo = 0;
			let secc_prenvencion_riesgo = 0;

			let id_rol = request.user.idRol;
			let estado = data.id_state;	

			if ( id_rol== 1 ){ // SOLICITANTE
				if ( (estado == 3) || (estado == 5) ){
					btt_aprobar = 1;
					btt_rechazar = 1;										
				}			
			}else{
				if ( id_rol== 4 ){ // EJECUTOR
					if ( (estado == 1) || (estado == 3) || (estado == 5) ){
						btt_aprobar = 1;
						btt_rechazar = 1;					
					}
					if (estado == 6){
						btt_aprobar = 1;
						secc_instrucciones_especiales = 1;
						secc_termino_trabajo = 1;
					}
				}else{

					if ( id_rol== 2 ){ // JEFE DE AREA
						if ( (estado == 5) || (estado == 2) ){
							btt_aprobar = 1;
							btt_rechazar = 1;							
						}
						if (estado == 2){						
							btt_modificar = 1;
						}		
						secc_instrucciones_especiales = 1;
					}else{

						if ( id_rol== 3 ){ // PREVENCIONISTA DE RIESGO
							secc_instrucciones_especiales = 1;
							if (estado == 4){
								btt_aprobar = 1;
								btt_rechazar = 1;		
								btt_modificar = 1;						
							}
							if (estado == 8){
								btt_aprobar = 1;					
								secc_termino_trabajo = 1;
								secc_prenvencion_riesgo = 1;
							}
						}
					}
				}
			}
						
			//console.log(btt_aprobar);
			//console.log(btt_rechazar);
			//console.log(btt_modificar);

			if ( (estado == 3 &&  id_rol== 1 ) ||(  estado == 3 && id_rol== 4) || (estado == 5 &&  (id_rol== 1 ||  id_rol== 4 || id_rol== 2) )  ){
					let dataApprovalPointUsuario = await db.sequelize.query(
						/*'select id_work_permit, MAX(id) as maximo '
						+ ' from work_permit_state  '
						+ ' where id_work_permit IN (select id from work_permit where id_state IN (3,5) and id = :id_wp and `status` = \'1\' ) '
						+ ' and id IN  (select id_work_permit_state from  work_permit_approval_point where id_user = :id_user and id_work_permit_state = work_permit_state.id and `status` = \'A\' ) '
						+ ' and `status` = \'M\' '
						+ 'GROUP BY id_work_permit '*/
						' select id '
						+ ' from  work_permit_approval_point '
						+ ' where id_work_permit_state IN ( '
							// -- asegura que sea la ultima modificacion
							+ ' select MAX(id) '
							+ ' from work_permit_state   '
							+ ' where id_work_permit IN (select id from work_permit where id_state IN (3,5) and id = :id_wp and `status` = \'1\' ) ' 
							+ ' and `status` = \'M\'	'	
							+ ' )'
							+ ' and id_user = :id_user '
							+ ' and `status` = \'A\' '
						,
						{
							replacements: { id_wp: id , id_user: idUser},                    
							raw: true,
							type: QueryTypes.SELECT
						}
					);

					//console.log(dataApprovalPointUsuario);

					
					if (!dataApprovalPointUsuario || (dataApprovalPointUsuario.length === 0) ) {
						//console.log('VACIO');	
						// YO TIENE NADA QUE APROBAR NO ACTIVO BOTONES	
						btt_aprobar = 1;
						btt_rechazar = 1;			
					}else{			
						btt_aprobar = 0;
						btt_rechazar = 0;			
					}

					//console.log(id);
					//console.log(idUser);
					//console.log(btt_aprobar);
					//console.log(btt_rechazar);
					//console.log(btt_modificar);
			}

			let dataBotonera = {
				btt_aprobar: btt_aprobar,
				btt_rechazar: btt_rechazar,
				btt_modificar: btt_modificar,
				secc_instrucciones_especiales: secc_instrucciones_especiales,
				secc_termino_trabajo: secc_termino_trabajo,
				secc_prenvencion_riesgo: secc_prenvencion_riesgo
			};

			let dataRES = {
				botonera: dataBotonera,
				workPermit: data,
				workPermitTypesOfWork: dataTypesOfWork,
				workPermitProtectiveElements: dataProtectiveElements,
				workPermitMandatoryControls: dataMandatoryControls,
				workPermitEndWork: dataEndWork,
				workPermitStates: dataStates,
				workPermitApprovalPoint: dataApprovalPoint,
								
			};
			return response.status(200).send(dataRES);
		}
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

exports.getByUser = async (request, response) => {
	try {
		let id_usuario = request.user.id;  //request.params.id;
		const promiseInvoices = [];

		let data = await workPermitModel.findAll({						
			attributes: [
				'id'
			],
			where: {
				id_user: id_usuario,
				status: '1'
			},
			order: [
				['created_at', 'DESC']
			],
		});
		
		for (const file of data) {
			let id = file.id;

			let dataworkPermit = await workPermitModel.findOne({			
				include: [				
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					},
					{
						attributes: [
							'id', 'name'
						],
						model: plantModel,
						required: true
					},		
					{
						attributes: [
							'id', 'name'
						],
						model: areasModel,
						required: true
					},
					{
						attributes: [
							'id', 'id_area','name'
						],
						model: equipmentOrMachinesModel,
						required: true
					},
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_area','id_user'
						],
						model: areaManagerModel,
						required: true
					},			
					{
						attributes: [
							'id','name','direction','responsable_person','email'
						],
						model: contractorCompanyModel,
						required: true
					},	
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_user'
						],
						model: contractorCompanyExecutorModel,
						required: true
					},	
				],
				attributes: [
					'id', 'id_user', 'id_plant', 'id_area', 'id_area_manager', 'id_equipment', 'id_contractor_company', 'id_work_executor', 'work_permit_code', 'date_start', 'date_end', 'time_start', 'time_end', 'work_description', 'number_people', 'number_cards', 'protective_elements_other', 'special_instructions','worked_days', 'days_not_worked' , 'work_days_description'
				],
				where: {
					id: id,
					status: '1'
				}
			});

			let dataTypesOfWork = await workPermitTypesOfWorkModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: typesOfWorkModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit', 'id_type_of_work'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});
	
			let dataProtectiveElements = await workPermitProtectiveElementsModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: protectiveElementsModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_protective_elements'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
	
			let dataMandatoryControls = await workPermitMandatoryControlsModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: mandatoryControlsModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_mandatory_controls'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
	
			let dataEndWork = await workPermitEndWorkModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: endWorkModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_end_work'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
			
			let dataStates= await workPermitStateModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					}
				],
				attributes: [
					'id', 'id_work_permit', 'id_user', 'id_rol', 'status', 'date_state','token','justification','old_state'
				],
				where: {
					id_work_permit: id				
				}
			});	
	
			const { QueryTypes } = require('sequelize');
			let dataApprovalPoint = await db.sequelize.query(
				'Select wkap.id_work_permit_state, wkap.id_user, wkap.status, wkap.token, wkap.date_approval_point, u.`names`, u.sur_names, u.email, ar.`name` '
				+ ' from work_permit_state wps join work_permit_approval_point wkap on wkap.id_work_permit_state = wps.id '
				+ ' LEFT JOIN users u on wkap.id_user = u.id '
				+ ' left JOIN user_roles ar on u.id_rol = ar.id '
				+ ' where wps.id_work_permit = :id_wp '
				+ ' and wps.`status`=\'M\';', 
				{
					replacements: { id_wp: id },                    
					raw: true,
					type: QueryTypes.SELECT
				}
			);

			let dataRE = {
				id_workPermit: id,
				workPermit: dataworkPermit,
				workPermitTypesOfWork: dataTypesOfWork,
				workPermitProtectiveElements: dataProtectiveElements,
				workPermitMandatoryControls: dataMandatoryControls,
				workPermitEndWork: dataEndWork,
				workPermitStates: dataStates,
				workPermitApprovalPoint: dataApprovalPoint,
								
			};
			promiseInvoices.push(dataRE)
		}			
		
		if (!promiseInvoices) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {			
		
			return response.status(200).send(promiseInvoices);
		}
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

exports.getHistoryByUser = async (request, response) => {
	try {		
		const promiseInvoices = [];
		let id_usuario = request.user.id;
		const { QueryTypes } = require('sequelize');
		let queryy = ''; 
		let id_rol = request.user.idRol;

		if (id_rol== 1 ){ // SOLICITANTE			
				/*queryy = `select id_work_permit, MAX(id) as maximo `
				+ ` from work_permit_state  `
				+ ' where id_work_permit IN (select id from work_permit where id_user = :id_wp and id_state IN (1,3,5) and `status` = \'1\' ) '
				+ ` GROUP BY id_work_permit `
				+ ` order by id_work_permit desc`;*/				
				queryy = ` select id_work_permit, MAX(id) as maximo  `
				+ ` from work_permit_state   `
				+ '  where id_work_permit IN (select id from work_permit where id_user = :id_wp and id_state = 1 and `status` = \'1\' ) '
				+ ` GROUP BY id_work_permit  `
				+ ` UNION ( `
					+ `		select id_work_permit, MAX(id) as maximo  `
					+ `	from work_permit_state   `
					+ '	where id_work_permit IN (select id from work_permit where id_user = :id_wp and id_state IN (3,5) and `status` = \'1\' ) '
					+ '	and id IN  (select id_work_permit_state from  work_permit_approval_point where id_user = :id_wp and id_work_permit_state = work_permit_state.id and `status` = \'I\' ) '
					+ '	and `status` = \'M\' '
					+ `	GROUP BY id_work_permit  `
					+ ') '
					+ `order by id_work_permit desc; `				
		}else{				
			if (id_rol== 4 ){ // EXECUTOR
					/*queryy = `select id_work_permit, MAX(id) as maximo `
					+ ` from work_permit_state  `
					+ ' where id_work_permit IN ( select id from work_permit where id_work_executor IN ( select id from contractor_company_executor where id_user = :id_wp ) and id_state IN (1,3,5,6) and `status` = \'1\'  ) '
					+ ` GROUP BY id_work_permit `
					+ ` order by id_work_permit desc`;	*/

					queryy = ` select id_work_permit, MAX(id) as maximo `
					+ `  from work_permit_state `
					+ '  where id_work_permit IN ( select id from work_permit where id_work_executor IN ( select id from contractor_company_executor where id_user=:id_wp ) and id_state IN (1,6) and `status` = \'1\'  '
					+ ' and now() BETWEEN STR_TO_DATE( CONCAT(date_start,\' \',time_start) , \'%Y-%m-%d %H:%i:%s\' ) and '
					+ '		STR_TO_DATE(CONCAT(DATE_ADD(date_end, INTERVAL 1 DAY), \' \', time_end), \'%Y-%m-%d %H:%i:%s\')	'
					+ ' ) '
					+ ` GROUP BY id_work_permit  `
					+ `  UNION ( `
					+ ` select id_work_permit, MAX(id) as maximo  `
					+ ` from work_permit_state `
					+ ' where id_work_permit IN ( select id from work_permit where id_work_executor IN ( select id from contractor_company_executor where id_user= :id_wp ) and id_state IN (3,5) and `status` = \'1\'  '
					+ ' and now() BETWEEN STR_TO_DATE( CONCAT(date_start,\' \',time_start) , \'%Y-%m-%d %H:%i:%s\' ) and ' 
					+ '	STR_TO_DATE(CONCAT(DATE_ADD(date_end, INTERVAL 1 DAY),\' \', time_end), \'%Y-%m-%d %H:%i:%s\') '
					+ ' ) '
					+ ' and id IN  (select id_work_permit_state from  work_permit_approval_point where id_user = :id_wp and id_work_permit_state = work_permit_state.id and `status` = \'I\' ) '
					+ ' and `status` = \'M\' '
					+ ` GROUP BY id_work_permit  `
					+ ' ) order by id_work_permit desc  LIMIT 1';
					
			}else{	
				if (id_rol== 2 ){ // JEFE DE AREA
					/*queryy =`select id_work_permit, MAX(id) as maximo `
					+ ` from work_permit_state  `
					+ ' where id_work_permit IN ( select id from work_permit where id_area_manager IN ( select id from area_manager where id_user = :id_wp ) and id_state IN (2,5) and `status` = \'1\'   ) '
					+ ` GROUP BY id_work_permit `
					+ ` order by id_work_permit desc`;		*/			
					queryy =` select id_work_permit, MAX(id) as maximo `
					+ ` from work_permit_state  `
					+ ' where id_work_permit IN ( select id from work_permit where id_area_manager IN ( select id from area_manager where id_user = :id_wp ) and id_state IN (2) and `status` = \'1\') '
					+ ` GROUP BY id_work_permit  `
					+ ` UNION (  `
						+ ` select id_work_permit, MAX(id) as maximo `
						+ ` from work_permit_state  `
					+ ' where id_work_permit IN ( select id from work_permit where id_area_manager IN ( select id from area_manager where id_user = :id_wp ) and id_state IN (5) and `status` = \'1\'   ) '
					+ ' 	and id IN  (select id_work_permit_state from  work_permit_approval_point where id_user = :id_wp and id_work_permit_state = work_permit_state.id and `status` = \'I\' ) '
					+ `GROUP BY id_work_permit  `
					+ ` ) order by id_work_permit desc `

				}else{
					// PREVENCiONISTA
					queryy =`select id_work_permit, MAX(id) as maximo `
					+ ` from work_permit_state  `
					+ ' where id_work_permit IN ( select id from work_permit where id_plant IN ( select id_plant from plant_preventionist where id_user = :id_wp ) and id_state IN (4,8) and `status` = \'1\' ) '
					+ ` GROUP BY id_work_permit `
					+ ` order by id_work_permit desc`;				
				}
			}
		}
	
		let data_WPE = await db.sequelize.query(
			queryy,
			{
				replacements: { id_wp: id_usuario },                    
				raw: true,
				type: QueryTypes.SELECT
			}
		);
		
		for (const file of data_WPE) {		
			let datadevolver = await workPermitStateModel.findOne({						
				include: [
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					},				
					{    
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							},
							{    
							include: [				
									{
										attributes: [
											'id', 'name'
										], 																
										model: typesOfWorkModel,
										required: true
									}
									], 
								attributes: [
									'id', 'id_work_permit', 'id_type_of_work'
								],    
								model: workPermitTypesOfWorkModel,
								required: true
							},
							{
								attributes: [
									'id', 'name'
								],
								model: statesWorkPermitModel,
								required: true
							},
							], 
							    
						model: workPermitModel,
						required: true			
					},						
					{       
						attributes: [
							'id', 'name' , 'description'
						],  
						model: userRolesModel,
						required: true
					}
				],
				where: {
					id_work_permit : file.id_work_permit,
					id : file.maximo,
				},			
				order: [
					['created_at', 'DESC']
				],
			});
			promiseInvoices.push(datadevolver)
		}

		if (!promiseInvoices) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {	
			return response.status(200).send(promiseInvoices);
		}			
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

// EXECUTOR PERMISO
exports.getByExecutor = async (request, response) => {
	try {
		let id_usuario = request.params.id;
		const promiseInvoices = [];

		const { QueryTypes } = require('sequelize');
			let data_WP_Activo = await db.sequelize.query(
				'select id '
				+ `  from work_permit `
				+ `  where id_work_executor IN ( `
					+ ` select id from contractor_company_executor where id_user = :id_wp `
					+ ` ) `
					+ ` and now() BETWEEN STR_TO_DATE(CONCAT(date_start, ' ', time_start), '%Y-%m-%d %H:%i:%s') and STR_TO_DATE(CONCAT(date_end, ' ', time_end), '%Y-%m-%d %H:%i:%s') order by id desc limit 1`,
				{
					replacements: { id_wp: id_usuario },                    
					raw: true,
					type: QueryTypes.SELECT
				}
			);
			//console.log(data_WP_Activo);

		for (const file of data_WP_Activo) {
			let id = file.id;

			let dataworkPermit = await workPermitModel.findOne({			
				include: [				
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					},
					{
						attributes: [
							'id', 'name'
						],
						model: plantModel,
						required: true
					},		
					{
						attributes: [
							'id', 'name'
						],
						model: areasModel,
						required: true
					},
					{
						attributes: [
							'id', 'id_area','name'
						],
						model: equipmentOrMachinesModel,
						required: true
					},
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_area','id_user'
						],
						model: areaManagerModel,
						required: true
					},			
					{
						attributes: [
							'id','name','direction','responsable_person','email'
						],
						model: contractorCompanyModel,
						required: true
					},	
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_user'
						],
						model: contractorCompanyExecutorModel,
						required: true
					},	
				],
				attributes: [
					'id', 'id_user', 'id_plant', 'id_area', 'id_area_manager', 'id_equipment', 'id_contractor_company', 'id_work_executor', 'work_permit_code', 'date_start', 'date_end', 'time_start', 'time_end', 'work_description', 'number_people', 'number_cards', 'protective_elements_other', 'special_instructions','worked_days', 'days_not_worked' , 'work_days_description'
				],
				where: {
					id: id,
					status: '1'
				}
			});
			let dataTypesOfWork = await workPermitTypesOfWorkModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: typesOfWorkModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit', 'id_type_of_work'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});
	
			let dataProtectiveElements = await workPermitProtectiveElementsModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: protectiveElementsModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_protective_elements'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
	
			let dataMandatoryControls = await workPermitMandatoryControlsModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: mandatoryControlsModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_mandatory_controls'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
	
			let dataEndWork = await workPermitEndWorkModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'name'
						],
						model: endWorkModel,
						required: false
					}
				],
				attributes: [
					'id', 'id_work_permit','id_end_work'
				],
				where: {
					id_work_permit: id,
					status: '1'
				}
			});	
			
			let dataStates= await workPermitStateModel.findAll({					
				include: [
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					}
				],
				attributes: [
					'id', 'id_work_permit', 'id_user', 'id_rol', 'status', 'date_state','token','justification','old_state'
				],
				where: {
					id_work_permit: id				
				}
			});	
	
			const { QueryTypes } = require('sequelize');
			let dataApprovalPoint = await db.sequelize.query(
				'Select wkap.id_work_permit_state, wkap.id_user, wkap.status, wkap.token, wkap.date_approval_point, u.`names`, u.sur_names, u.email, ar.`name` '
				+ ' from work_permit_state wps join work_permit_approval_point wkap on wkap.id_work_permit_state = wps.id '
				+ ' LEFT JOIN users u on wkap.id_user = u.id '
				+ ' left JOIN user_roles ar on u.id_rol = ar.id '
				+ ' where wps.id_work_permit = :id_wp '
				+ ' and wps.`status`=\'M\';', 
				{
					replacements: { id_wp: id },                    
					raw: true,
					type: QueryTypes.SELECT
				}
			);

			let dataRE = {
				id_workPermit: id,
				workPermit: dataworkPermit,
				workPermitTypesOfWork: dataTypesOfWork,
				workPermitProtectiveElements: dataProtectiveElements,
				workPermitMandatoryControls: dataMandatoryControls,
				workPermitEndWork: dataEndWork,
				workPermitStates: dataStates,
				workPermitApprovalPoint: dataApprovalPoint,
								
			};
			promiseInvoices.push(dataRE)
		}			
		
		if (!promiseInvoices) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {			
		
			return response.status(200).send(promiseInvoices);
		}
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

// GUARDADO DE LOS DIFERENTES ACTORES
exports.save = async (request, response) => {
	try {
		let body = request.body;				
		let new_code = 0;
		let new_id = '';

		if(body.hasOwnProperty('workPermit')){

			//Validar fechas del ejecutor
			// body.workPermit.id_work_executor
			// if (){

			const { QueryTypes } = require('sequelize');
			let dataExecutorDates = await db.sequelize.query(
				'select  id '
				+ ' from work_permit '
				+ ' where `status` = \'1\' '
				+ ' and id_work_executor = :ejecutor '
				+ ' and  ( STR_TO_DATE( CONCAT(date_end, \' \', time_end), \'%Y-%m-%d %H:%i:%s\')	>= STR_TO_DATE( CONCAT(:fecha_star, \' \', :hora_star), \'%Y-%m-%d %H:%i:%s\') '
				+ ' and  '
				+ ' STR_TO_DATE( CONCAT(:fecha_end, \' \', :hora_end), \'%Y-%m-%d %H:%i:%s\')  >=  STR_TO_DATE( CONCAT(date_start,\' \',time_start) , \'%Y-%m-%d %H:%i:%s\' ) '
				+ ' ) '
				+ ' order by id desc limit 1;', 
				{
					replacements: { ejecutor: body.workPermit.id_work_executor , fecha_star : body.workPermit.date_start , hora_star: body.workPermit.time_start , fecha_end:body.workPermit.date_end , hora_end : body.workPermit.time_end },                    
					raw: true,
					type: QueryTypes.SELECT
				}
			);
			//console.log(dataExecutorDates);

			if (dataExecutorDates && dataExecutorDates != [] && (dataExecutorDates.length != 0) ) {
				return response.status(409).send({ message: i18n.__(`The Executor already has a Work Permit with that date range, please validate the dates.`) });
			}
				
			let datamaxCode = await workPermitModel.findAll({
				attributes: [
					[sequelize.fn('MAX', sequelize.col('work_permit_code')), 'maxCode']
				],
				raw: true,
			});					 		  
			
			new_code = datamaxCode[0].maxCode + 1;
						
			let [data, created] = await workPermitModel.findOrCreate({	
				where: {
					work_permit_code: new_code
				},			
				defaults: {
					id_user: body.workPermit.id_user,
					id_plant: body.workPermit.id_plant,
					id_area: body.workPermit.id_area,
					id_area_manager: body.workPermit.id_area_manager,
					id_equipment: body.workPermit.id_equipment,
					id_contractor_company: body.workPermit.id_contractor_company,
					id_work_executor: body.workPermit.id_work_executor,
					id_state: 1,
					work_permit_code : new_code,
					date_start: body.workPermit.date_start,
					date_end: body.workPermit.date_end,
					time_start: body.workPermit.time_start,
					time_end: body.workPermit.time_end,
					work_description: body.workPermit.work_description,
					number_people: body.workPermit.number_people,
					number_cards: body.workPermit.number_cards,
					protective_elements_other: body.workPermit.protective_elements_other,
					special_instructions: body.workPermit.special_instructions,
					worked_days: body.workPermit.worked_days,
					days_not_worked: body.workPermit.days_not_worked,
					work_days_description: body.workPermit.work_days_description
				}
			});
				
				new_id = data.dataValues.id;

				if ( new_id != '' ) {
					if(body.hasOwnProperty('workPermitTypesOfWork')){
						let  tipos_wp = body.workPermitTypesOfWork;

						for (var i=0; i < tipos_wp.length; i++) {
							//console.log(tipos_wp[i] + " / ");
							const inserted = await workPermitTypesOfWorkModel.create(
								{ 
									id_work_permit: new_id,
									id_type_of_work: tipos_wp[i]
							 	}
								 );

						}

					}
					if(body.hasOwnProperty('workPermitProtectiveElements')){
						if ( body.workPermitProtectiveElements != [] ) {						
							let  tipos_wp = body.workPermitProtectiveElements;
							for (var i=0; i < tipos_wp.length; i++) {
								//console.log(tipos_wp[i] + " * ");
								const inserted = await workPermitProtectiveElementsModel.create(
									{ 
										id_work_permit: new_id,
										id_protective_elements: tipos_wp[i]
									 }
									 );
							}
						}
					}
					if(body.hasOwnProperty('workPermitMandatoryControls')){
						if ( body.workPermitMandatoryControls != [] ) {						
							let  tipos_wp = body.workPermitMandatoryControls;
							for (var i=0; i < tipos_wp.length; i++) {
								//console.log(tipos_wp[i] + " - ");
								const inserted = await workPermitMandatoryControlsModel.create(
									{ 
										id_work_permit: new_id,
										id_mandatory_controls: tipos_wp[i]
									 }
									 );
							}
						}

					}
					if(body.hasOwnProperty('workPermitEndWork')){
						if ( body.workPermitEndWork != [] ) {						
							let  tipos_wp = body.workPermitEndWork;
							for (var i=0; i < tipos_wp.length; i++) {
								//console.log(tipos_wp[i] + " + ");
								const inserted = await workPermitEndWorkModel.create(
									{ 
										id_work_permit: new_id,
										id_end_work: tipos_wp[i]
									 }
									 );
							}
						}

					}
					//Se ingresa el insert de Estado Inicial del Permiso					
					const now = moment();
					let token = uuidv4();
					let log = new workPermitStateModel ({
						id_work_permit: new_id,
						id_user: request.user.id,
						id_rol: request.user.idRol,
						status: 'S',
						token: token,
						date_state: now,						
						created_at: now											  
					});
		
					log.save((error, logDb) => {
						if (error) {
							console.error(error);
						}
					});

					//Se envia el Correo al Executor para que apruebe el Permiso
					// BUSCO EL EXECUTOR SELECCIONADO 
					let dataExecutor = await contractorCompanyExecutorModel.findOne({
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email','password'
								],
								model: usersModel,
								required: true
							}
						],						
						where: {
							id: body.workPermit.id_work_executor,
							status: '1'
						}
					});
					
					//console.log(dataExecutor);

					if (!dataExecutor) {
						return response.status(404).send({ message: i18n.__(`No records %s`) });
					}
					else {
						//consiguio el Executor
						let correo = dataExecutor.users_model.email;
						let codigowhitzeros  = new_code; // zeroPad(new_code, 8);
						let tokenExecutor = dataExecutor.users_model.password;
						//console.log(correo);
										
						let mailOptions = {
							to: correo,
							subject: i18n.__(`Registered Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
							text: i18n.__(`A Work Permit has been registered for your approval, Code: <b>{{codigo}}</b>. <br><br>To enter the Mobile Application use the following token: <b>{{token}}</b>`,{codigo:codigowhitzeros, token:tokenExecutor})
						};
						sendEmail(mailOptions, 2);

					}
					//return response.status(201).send({ message: i18n.__(`Successful registration`) });
					
				}
				//console.log(' New id:'. data.id);				
				//console.log(data.dataValues.id);
				//console.log(created);

				if (!created) {
					return response.status(409).send({ message: i18n.__(`Error in the request`) });
				}
				else {
					return response.status(201).send({ message: i18n.__(`Successful registration`) });
				}
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

//APROBACIONES y REJECT de cada actor
exports.aprobacionApplicant = async (request, response) => {
	try {
		let body = request.body;				
		let new_code = 0;
		let wp_estate = 0;
		let id_WP = '';
		let stateReal = 2;
		let justificationIN = null;
		let texto_correo = 'Aprobado';
		let status_original = '1';
		
		if( (body.hasOwnProperty('id_workpermit')) && (body.hasOwnProperty('status')) ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			let dataWP = await workPermitModel.findOne({							
				attributes: [
					'id','id_state','work_permit_code'
				],
				where: {
					id: id_WP,
					status: '1'
				}
			});

			if (!dataWP) {
				return response.status(409).send({ message: i18n.__(`Error in the request`) });
			}else{
				wp_estate = dataWP.id_state;
			}

			if  ((wp_estate == 3) || (wp_estate == 5) ){
				//Es una aprobación de modificación codigo para manejarlo				
				// Si trae justificacion se busca y se Guarda.
				if(body.hasOwnProperty('justification') && (body.status == "R") ){
					stateReal = 7;
					status_original = '0';
					texto_correo = 'Rechazado';
					if ( body.justificationIN != [] ) {	
						justificationIN = body.justification;
					}
				}

				let id_userwp =  request.user.id;				
				let id_work_permit_state_WP = 0;
				let id_work_permit_state_approval = 0;
				let id_usuario_modi = 0;
				let id_usuario_rol_modi = 0;

				//se busca el punto de aprobacion para actualizarlo
				let dataEstadoPermiso = await workPermitStateModel.findOne({			
					attributes: [
						'id','id_user','id_rol'
					],
					where: {
						id_work_permit: id_WP,
						status: 'M',						
					},
					order: [
						['created_at', 'DESC']
					],
				});

				if (!dataEstadoPermiso) {
					return response.status(409).send({ message: i18n.__(`Error in the request`) });
				}else{
					//el estado existe ya que es una modificacion y toma el ultimo registro
					id_work_permit_state_WP = dataEstadoPermiso.id;
					id_usuario_modi = dataEstadoPermiso.id_user;
					id_usuario_rol_modi = dataEstadoPermiso.id_rol;
				}
 				
				if(id_work_permit_state_WP != 0 ){
					//console.log(id_work_permit_state_WP);
					//se busca el punto de aprobacion para actualizarlo
					let dataAprobacion = await workPermitApprovalPointModel.findOne({			
						include: [				
							{
								attributes: [
									'id'
								],
								model: usersModel,
								required: true,
								where: {									
									id: id_userwp
								}
							}
						],	
						attributes: [
							'id'
						],
						where: {
							id_work_permit_state: id_work_permit_state_WP							
						}
					});

					if (!dataAprobacion) {
						return response.status(409).send({ message: i18n.__(`Error in the request`) });
					}else{
						// existe un punto de aprobación para ese usuario
						id_work_permit_state_approval = dataAprobacion.id;
					}

					if (id_work_permit_state_approval!= 0){						
						//console.log(id_work_permit_state_approval);
						//tengo el id de punto de aprobación para modificar
						let now_approval = moment();
						let token_approval = uuidv4();

						if (body.status == "R"){
							//Fuen un Rechazo sigue el siguien codigo
							stateReal = 7;
							status_original = '0';
							texto_correo = 'Rechazado';

							// RECHAZO actualizo la aprobación y el pedido de una							
							let update_approval = await workPermitApprovalPointModel.update(
								{							
									status: 'R',
									token: token_approval,
									date_approval_point: now_approval,
									justification: justificationIN
								},
								{
									where: {
										id: id_work_permit_state_approval
									}
								}
							);
		
							if (!update_approval[0]) {
								return response.status(404).send({ message: i18n.__(`No records updated %s`) });
							}
							// Se actualiza el estado real del pedido
							let update = await workPermitModel.update(
								{							
									id_state: stateReal,
									status: status_original
								},
								{
									where: {
										id: id_WP
									}
								}
							);
							
							if (!update[0]) {
								return response.status(404).send({ message: i18n.__(`No records updated %s`) });
							}
							// FALTA revisar el envio de correo cuando se RECHAZA para todos los involucrados
							let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Solicitante. Rechazo la Modificación del Permiso',justificationIN,wp_estate);
							return response.status(201).send({ message: i18n.__(`Successful registration`) });							
						}else{
							// FUE APROBACION se actualiza el punto de aprobación  
							// y comparo las demas para dejar el pedido aprobado 
							//console.log(token_approval);
							//console.log(now_approval);
							let update_approval = await workPermitApprovalPointModel.update(
								{							
									status: 'A',
									token: token_approval,
									date_approval_point: now_approval									
								},
								{
									where: {
										id: id_work_permit_state_approval
									}
								}
							);

							// VALIDAR SI TODOS APROBARON EL PUNTO DE APROBACIÓN
							const { QueryTypes } = require('sequelize');
							let dataApprovalPoint = await db.sequelize.query(
								' SELECT id_work_permit_state , '
								+ ' count(id) as totales, '
								+ ' sum(case when  `status` =\'A\' then 1 else 0 end) as aprobados, '
								+ ' sum(case when  `status` =\'R\' then 1 else 0 end) as rechazados, '
								+ ' sum(case when  `status` =\'I\' then 1 else 0 end) as inciaiales '
								+ ' FROM `work_permit_approval_point` '
								+ ' where id_work_permit_state = :id_wp '
								+ ' group by id_work_permit_state ',								
								{
									replacements: { id_wp: id_work_permit_state_WP },                    
									raw: true,
									type: QueryTypes.SELECT
								}
							);

							//console.log(id_work_permit_state_WP);

							if (!dataApprovalPoint) {
								return response.status(409).send({ message: i18n.__(`Error in the request`) });
							}else{
								//console.log(dataApprovalPoint);
								let totales = dataApprovalPoint[0].totales;
								let aprobados = dataApprovalPoint[0].aprobados;
								let rechazados = dataApprovalPoint[0].rechazados;
								let inciaiales = dataApprovalPoint[0].inciaiales;

								/*console.log(totales);
								console.log(aprobados);
								console.log(rechazados);
								console.log(inciaiales);*/

								if ( (totales == aprobados) && (inciaiales == 0) && (rechazados == 0 ) ) {
									// Solo en este caso que ya todos contestaros que no hay estado en inciales y no hay rechazados
									// actualizo el pedido a aprobado
									// Se actualiza el estado real del pedido
										stateReal = 4;
										if (wp_estate == 5){
											stateReal = 6;
										}
										let update = await workPermitModel.update(
											{							
												id_state: stateReal
											},
											{
												where: {
													id: id_WP
												}
											}
										);
										if (!update[0]) {
											return response.status(404).send({ message: i18n.__(`No records updated %s`) });
										}

										if ( id_usuario_modi != 0 && id_usuario_rol_modi != 0 ){
											//Se ingresa el insert de Estado del Permiso					
											// SI TODO ESTA BIEN Y TODOS RESPONDIERON OK ENTONCES INGRESO LA APROBACION DEL PEERMISO
											const now = moment();
											let token = uuidv4();

											let log = new workPermitStateModel ({
												id_work_permit: id_WP,
												id_user: id_usuario_modi,
												id_rol: id_usuario_rol_modi,
												status: 'A',
												token: token,
												justification : 'TODOS APROBARON MODIFICACION', 
												date_state: now,						
												created_at: now											  
											});
								
											log.save((error, logDb) => {
												if (error) {
													console.error(error);
												}
											});

										} 

										if (wp_estate == 5){																																																				
											let datarespuesta = await enviarcorreo(id_WP, 'Aprobado' , 'El permiso de Trabajo fue Aprobado por todos los usuarios','Permiso Aprobado',wp_estate);
										}else{
												//Se envia el Correo al Jefe de Area para que vea el correo
												// BUSCO EL Jefe de Area SELECCIONADO 				
												let dataActor = await workPermitModel.findOne({			
													include: [	
														{
															include: [				
																{
																	attributes: [
																		'id', 'email'
																	],
																	model: usersModel,
																	required: true
																}
															],
															attributes: [
																'id', 'id_area','id_user'
															],
															model: areaManagerModel,
															required: true
														}
													],
													attributes: [
														'id','id_area_manager','work_permit_code'
													],
													where: {
														id: id_WP,
														status: '1'
													}
												});
												
												if (!dataActor) {
													return response.status(409).send({ message: i18n.__(`Error in the request`) });
												}
												else {
													//consiguio el Jefe de Area
													let correo = dataActor.area_manager_model.users_model.email;
													new_code = dataActor.work_permit_code;
													let codigowhitzeros  =  new_code; //zeroPad(cod_PW, 8);								
													//console.log(correo);										
													let mailOptions = {
														to: correo,
														subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:new_code}),
														text: i18n.__(`The modification of the work permit has been approved by all users, Work Permit Code: <b>{{codigo}}</b>`,{codigo:codigowhitzeros})
													};
													sendEmail(mailOptions, 2);
													
												}														
												// BUSCO TODOS LOS PREVENCIONISTAS DE RIESGO PARA MANDAR CORREOS									
												let datapermiso = await workPermitModel.findOne({			
													attributes: [
														'id','id_plant','work_permit_code'
													],
													where: {
														id: id_WP,
														status: '1'
													}
												});
												
												let id_plantaIN = datapermiso.id_plant;
												let cod_PW = datapermiso.work_permit_code;

												let dataActorPreventionist = await plantPreventionistModel.findAll({			
													include: [				
														{
															attributes: [
																'id', 'email'
															],
															model: usersModel,
															required: true
														}
													],
													where: {
														id_plant: id_plantaIN,
														status: '1'
													}
												});
												
												for (var i=0; i < dataActorPreventionist.length; i++) {						
													//console.log(dataActor[i].users_model.email);
													//consiguio el Executor
													let correo = dataActorPreventionist[i].users_model.email;
													let codigowhitzeros  =  cod_PW; //zeroPad(cod_PW, 8);						
													//console.log(correo);
													let texto_correo = 'Aprobado';																
													let mailOptions = {
														to: correo,
														subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
														text: i18n.__(`The work permit has been {{texto}} by the Manager Area, Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application for review.`,{codigo:codigowhitzeros, texto:texto_correo})
													};
													sendEmail(mailOptions, 2);
												}
													
										}

										return response.status(201).send({ message: i18n.__(`Successful registration`) });
										
								}else{
									return response.status(201).send({ message: i18n.__(`Successful registration`) });
								}
							}				
						}
					}else{
						return response.status(409).send({ message: i18n.__(`Error in the request`) });
					}

				}else{
					return response.status(409).send({ message: i18n.__(`Error in the request`) });
				}		
			}else{
				return response.status(409).send({ message: i18n.__(`Error in the request`) });
			}
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

exports.aprobacionExecutor = async (request, response) => {
	try {
		let body = request.body;				
		let new_code = 0;
		let wp_estate = 0;
		let id_WP = '';
		let stateReal = 2;
		let justificationIN = null;
		let texto_correo = 'Aprobado';
		let status_original = '1';
		
		if( (body.hasOwnProperty('id_workpermit')) && (body.hasOwnProperty('status')) ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			let dataWP = await workPermitModel.findOne({							
				attributes: [
					'id','id_state','work_permit_code'
				],
				where: {
					id: id_WP,
					status: '1'
				}
			});

			if (!dataWP) {
				return response.status(409).send({ message: i18n.__(`Error in the request`) });
			}else{
				wp_estate = dataWP.id_state;
			}

			if  ((wp_estate == 3) || (wp_estate == 5) ){
				//Es una aprobación de modificación codigo para manejarlo
				
				// Si trae justificacion se busca y se Guarda.
				if(body.hasOwnProperty('justification') && (body.status == "R") ){
					stateReal = 7;
					status_original = '0';
					texto_correo = 'Rechazado';
					if ( body.justificationIN != [] ) {	
						justificationIN = body.justification;
					}
				}

				let id_userwp =  request.user.id;
				let id_rol = request.user.idRol;
				let id_work_permit_state_WP = 0;
				let id_work_permit_state_approval = 0;
				let id_usuario_modi = 0;
				let id_usuario_rol_modi = 0;

				//se busca el punto de aprobacion para actualizarlo
				let dataEstadoPermiso = await workPermitStateModel.findOne({			
					attributes: [
						'id','id_user','id_rol'
					],
					where: {
						id_work_permit: id_WP,
						status: 'M',						
					},
					order: [
						['created_at', 'DESC']
					],
				});

				if (!dataEstadoPermiso) {
					return response.status(409).send({ message: i18n.__(`Error in the request`) });
				}else{
					id_work_permit_state_WP = dataEstadoPermiso.id;
					id_usuario_modi = dataEstadoPermiso.id_user;
					id_usuario_rol_modi = dataEstadoPermiso.id_rol;
				}
 				
				if(id_work_permit_state_WP != 0 ){
					//console.log(id_work_permit_state_WP);
					//se busca el punto de aprobacion para actualizarlo
					let dataAprobacion = await workPermitApprovalPointModel.findOne({			
						include: [				
							{
							attributes: [
								'id'
							],
							model: usersModel,
							required: true,
							where: {									
								id: id_userwp
							}
							}
						],	
						attributes: [
							'id'
						],
						where: {
							id_work_permit_state: id_work_permit_state_WP							
						}
					});

					if (!dataAprobacion) {
						return response.status(409).send({ message: i18n.__(`Error in the request`) });
					}else{
						id_work_permit_state_approval = dataAprobacion.id;
					}

					if (id_work_permit_state_approval!= 0){						
						//id_work_permit_state_approval);
						//tengo el id de punto de aprobación para modificar
						let now_approval = moment();
						let token_approval = uuidv4();

						if (body.status == "R"){
							// RECHAZO actualizo la aprobación y el pedido de una							
							let update_approval = await workPermitApprovalPointModel.update(
								{							
									status: 'R',
									token: token_approval,
									date_approval_point: now_approval,
									justification: justificationIN
								},
								{
									where: {
										id: id_work_permit_state_approval
									}
								}
							);
		
							if (!update_approval[0]) {
								return response.status(404).send({ message: i18n.__(`No records updated %s`) });
							}
							// Se actualiza el estado real del pedido
							let update = await workPermitModel.update(
								{							
									id_state: stateReal,
									status: status_original
								},
								{
									where: {
										id: id_WP
									}
								}
							);
							if (!update[0]) {
								return response.status(404).send({ message: i18n.__(`No records updated %s`) });
							}
							
							// FALTA revisar el envio de correo cuando se RECHAZA para todos los involucrados							
							let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Ejecutor. Rechazo la Modificación del Permiso',justificationIN,wp_estate);

							return response.status(201).send({ message: i18n.__(`Successful registration`) });
						}else{
							// FUE APROBACION se actualiza el punto de aprobación  
							// y comparo las demas para dejar el pedido parobado o no
							//console.log(token_approval);
							//now_approval);
							let update_approval = await workPermitApprovalPointModel.update(
								{							
									status: 'A',
									token: token_approval,
									date_approval_point: now_approval									
								},
								{
									where: {
										id: id_work_permit_state_approval
									}
								}
							);

							const { QueryTypes } = require('sequelize');
							let dataApprovalPoint = await db.sequelize.query(
								' SELECT id_work_permit_state , '
								+ ' count(id) as totales, '
								+ ' sum(case when  `status` =\'A\' then 1 else 0 end) as aprobados, '
								+ ' sum(case when  `status` =\'R\' then 1 else 0 end) as rechazados, '
								+ ' sum(case when  `status` =\'I\' then 1 else 0 end) as inciaiales '
								+ ' FROM `work_permit_approval_point` '
								+ ' where id_work_permit_state = :id_wp '
								+ ' group by id_work_permit_state ',								
								{
									replacements: { id_wp: id_work_permit_state_WP },                    
									raw: true,
									type: QueryTypes.SELECT
								}
							);

							//console.log(id_work_permit_state_WP);

							if (!dataApprovalPoint) {
								return response.status(409).send({ message: i18n.__(`Error in the request`) });
							}else{
								//console.log(dataApprovalPoint);
								let totales = dataApprovalPoint[0].totales;
								let aprobados = dataApprovalPoint[0].aprobados;
								let rechazados = dataApprovalPoint[0].rechazados;
								let inciaiales = dataApprovalPoint[0].inciaiales;

								/*console.log(totales);
								console.log(aprobados);
								console.log(rechazados);
								console.log(inciaiales);*/

								if ( (totales == aprobados) && (inciaiales == 0) && (rechazados == 0 ) ) {
									// Solo en este caso que ya todos contestaros que no hay estado en inciales y no hay rechazados
									// actualizo el pedido a aprobado
									// Se actualiza el estado real del pedido
									stateReal = 4;
									if (wp_estate == 5){
										stateReal = 6;
									}
										
										let update = await workPermitModel.update(
											{							
												id_state: stateReal
											},
											{
												where: {
													id: id_WP
												}
											}
										);
										if (!update[0]) {
											return response.status(404).send({ message: i18n.__(`No records updated %s`) });
										}

										if ( id_usuario_modi != 0 && id_usuario_rol_modi != 0 ){

											let now_wpsm = moment();
											let token_wpsm  = uuidv4();

											let log = new workPermitStateModel ({
												id_work_permit: id_WP,
												id_user: id_usuario_modi,
												id_rol: id_usuario_rol_modi,
												status: 'A',
												token: token_wpsm,
												justification : 'TODOS APROBARON MODIFICACION', 
												date_state: now_wpsm,						
												created_at: now_wpsm											  
											});
								
											log.save((error, logDb) => {
												if (error) {
													console.error(error);
												}
											});

										} 

										if (wp_estate == 5){											
											let datarespuesta = await enviarcorreo(id_WP, 'Aprobado' , 'El permiso de Trabajo fue Aprobado por todos los usuarios','Permiso Aprobado',wp_estate);
										}else{												
											// BUSCO EL Jefe de Area SELECCIONADO 				
											let dataActor = await workPermitModel.findOne({			
												include: [	
													{
														include: [				
															{
																attributes: [
																	'id', 'email'
																],
																model: usersModel,
																required: true
															}
														],
														attributes: [
															'id', 'id_area','id_user'
														],
														model: areaManagerModel,
														required: true
													}
												],
												attributes: [
													'id','id_area_manager','work_permit_code'
												],
												where: {
													id: id_WP,
													status: '1'
												}
											});
											
											if (!dataActor) {
												return response.status(409).send({ message: i18n.__(`Error in the request`) });
											}
											else {
												//consiguio el Jefe de Area
												let correo = dataActor.area_manager_model.users_model.email;
												let new_code = dataActor.work_permit_code;
												
												let codigowhitzeros  =  new_code; //zeroPad(cod_PW, 8);		
												//console.log(correo);										
												let mailOptions = {
													to: correo,
													subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:new_code}),
													text: i18n.__(`The modification of the work permit has been approved by all users, Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application for review.`,{codigo:codigowhitzeros})
												};
												sendEmail(mailOptions, 2);

												// BUSCO TODOS LOS PREVENCIONISTAS DE RIESGO PARA MANDAR CORREOS									
												let datapermiso = await workPermitModel.findOne({			
													attributes: [
														'id','id_plant','work_permit_code'
													],
													where: {
														id: id_WP,
														status: '1'
													}
												});
												
												let id_plantaIN = datapermiso.id_plant;
												let cod_PW = datapermiso.work_permit_code;

												let dataActorPreventionist = await plantPreventionistModel.findAll({			
													include: [				
														{
															attributes: [
																'id', 'email'
															],
															model: usersModel,
															required: true
														}
													],
													where: {
														id_plant: id_plantaIN,
														status: '1'
													}
												});
												
												for (var i=0; i < dataActorPreventionist.length; i++) {						
													//console.log(dataActor[i].users_model.email);
													//consiguio el Executor
													let correo = dataActorPreventionist[i].users_model.email;
													let codigowhitzeros  =  cod_PW; //zeroPad(cod_PW, 8);						
													//console.log(correo);
													let texto_correo = 'Aprobado';																
													let mailOptions = {
														to: correo,
														subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
														text: i18n.__(`The work permit has been {{texto}} by the Manager Area, Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application for review.`,{codigo:codigowhitzeros, texto:texto_correo})
													};
													sendEmail(mailOptions, 2);
												}
												
											}	
										}
										return response.status(201).send({ message: i18n.__(`Successful registration`) });
										
								}else{
									return response.status(201).send({ message: i18n.__(`Successful registration`) });
								}
							}
				
						}
					}else{
						return response.status(409).send({ message: i18n.__(`Error in the request`) });
					}
				
				}else{
					return response.status(409).send({ message: i18n.__(`Error in the request`) });
				}				
			
			}else{
			// una aprobación normal 
				if ( id_WP != '' ) {

						if(body.hasOwnProperty('justification') && (body.status == "R") ){
							stateReal = 7;
							status_original = '0';
							texto_correo = 'Rechazado';
							if ( body.justificationIN != [] ) {	
								justificationIN = body.justification;
							}

						}						

						// Si trae justificacion se busca y se Guarda.
						let update = await workPermitModel.update(
							{							
								id_state: stateReal,
								status: status_original
							},
							{
								where: {
									id: id_WP
								}
							}
						);
				
						if (!update[0]) {
							return response.status(404).send({ message: i18n.__(`No records updated %s`) });
						}		
						
						//Se ingresa el insert de Estado Inicial del Permiso					
						const now = moment();
						let token = uuidv4();
						let log = new workPermitStateModel ({
							id_work_permit: id_WP,
							id_user: request.user.id,
							id_rol: request.user.idRol,
							status: body.status,
							token: token,
							justification : justificationIN, 
							date_state: now,						
							created_at: now											  
						});
			
						log.save((error, logDb) => {
							if (error) {
								console.error(error);
							}
						});
						// ENVIO DE CORREOS SEGUN EL CASO
						if (stateReal == 7){
							let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Ejecutor', justificationIN,wp_estate);
						}else{
								//Se envia el Correo al Jefe de Area para que apruebe el Permiso
								// BUSCO EL Jefe de Area SELECCIONADO 				
								let dataActor = await workPermitModel.findOne({			
									include: [	
										{
											include: [				
												{
													attributes: [
														'id', 'email'
													],
													model: usersModel,
													required: true
												}
											],
											attributes: [
												'id', 'id_area','id_user'
											],
											model: areaManagerModel,
											required: true
										}
									],
									attributes: [
										'id','id_area_manager','work_permit_code'
									],
									where: {
										id: id_WP
									}
								});
								
								if (!dataActor) {
									return response.status(409).send({ message: i18n.__(`Error in the request`) });
								}
								else {
									//consiguio el Jefe de Area
									let correo = dataActor.area_manager_model.users_model.email;
									new_code = dataActor.work_permit_code;
									//let codigowhitzeros  =  zeroPad(new_code, 8);						
									//console.log(correo);										
									let mailOptions = {
										to: correo,
										subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:new_code}),
										text: i18n.__(`The work permit has been {{texto}} by the Executor, Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application for review.`,{codigo:new_code, texto:texto_correo})
									};
									sendEmail(mailOptions, 2);									
								}	
							
						}	
						return response.status(201).send({ message: i18n.__(`Successful registration`) });
						
				}
			}
		}else{
			return response.status(409).send({ message: i18n.__(`Error in the request`) });
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

exports.aprobacionJefeArea = async (request, response) => {
	try {
		let body = request.body;						
		let id_WP = '';
		let justificationIN = null;
		let stateReal = 4;
		let wp_estate = 0;
		let texto_correo = 'Aprobado';
		let status_original = '1';
		let instructions_specials = '';

		if( (body.hasOwnProperty('id_workpermit')) && (body.hasOwnProperty('status')) ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			let dataWP = await workPermitModel.findOne({							
				attributes: [
					'id','id_state','work_permit_code'
				],
				where: {
					id: id_WP,
					status: '1'
				}
			});

			if (!dataWP) {
				return response.status(409).send({ message: i18n.__(`Error in the request`) });
			}else{
				wp_estate = dataWP.id_state;
			}

			if ( id_WP != '' ) {
					// Si trae justificacion se busca y se Guarda.
					if(body.hasOwnProperty('justification') && (body.status == "R") ){
						stateReal = 7;
						status_original = '0';
						texto_correo = 'Rechazado';
						if ( body.justificationIN != [] ) {	
							justificationIN = body.justification;
						}
						//let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Jefe de Área.',justificationIN);
					}
					
					if (wp_estate == 5){
						//Es una aprobación de modificación codigo para manejarlo
						let id_userwp =  request.user.id;						
						let id_work_permit_state_WP = 0;
						let id_work_permit_state_approval = 0;
						let id_usuario_modi = 0;
						let id_usuario_rol_modi = 0;
		
						//se busca el punto de aprobacion para actualizarlo
						let dataEstadoPermiso = await workPermitStateModel.findOne({			
							attributes: [
								'id','id_user','id_rol'
							],
							where: {
								id_work_permit: id_WP,
								status: 'M',						
							},
							order: [
								['created_at', 'DESC']
							],
						});
		
						if (!dataEstadoPermiso) {
							return response.status(409).send({ message: i18n.__(`Error in the request`) });
						}else{
							id_work_permit_state_WP = dataEstadoPermiso.id;
							id_usuario_modi = dataEstadoPermiso.id_user;
							id_usuario_rol_modi = dataEstadoPermiso.id_rol;
						}
						 
						if(id_work_permit_state_WP != 0 ){
							//console.log(id_work_permit_state_WP);
							//se busca el punto de aprobacion para actualizarlo
							let dataAprobacion = await workPermitApprovalPointModel.findOne({			
								include: [				
									{
									attributes: [
										'id'
									],
									model: usersModel,
									required: true,
									where: {									
										id: id_userwp
									}
									}
								],	
								attributes: [
									'id'
								],
								where: {
									id_work_permit_state: id_work_permit_state_WP							
								}
							});
		
							if (!dataAprobacion) {
								return response.status(409).send({ message: i18n.__(`Error in the request`) });
							}else{
								id_work_permit_state_approval = dataAprobacion.id;
							}
		
							if (id_work_permit_state_approval!= 0){						
								//console.log(id_work_permit_state_approval);
								//tengo el id de punto de aprobación para modificar
								let now_approval = moment();
								let token_approval = uuidv4();
		
								if (body.status == "R"){
									// RECHAZO actualizo la aprobación y el pedido de una							
									status_original = '0';
									texto_correo = 'Rechazado';

									let update_approval = await workPermitApprovalPointModel.update(
										{							
											status: 'R',
											token: token_approval,
											date_approval_point: now_approval,
											justification: justificationIN
										},
										{
											where: {
												id: id_work_permit_state_approval
											}
										}
									);
				
									if (!update_approval[0]) {
										return response.status(404).send({ message: i18n.__(`No records updated %s`) });
									}
									// Se actualiza el estado real del pedido
									let update = await workPermitModel.update(
										{							
											id_state: stateReal,
											status: status_original
										},
										{
											where: {
												id: id_WP
											}
										}
									);
									if (!update[0]) {
										return response.status(404).send({ message: i18n.__(`No records updated %s`) });
									}									
									// FALTA revisar el envio de correo cuando se RECHAZA para todos los involucrados
									let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Jefe de Área. Rechazo la Modificación del Permiso',justificationIN,wp_estate);								
									return response.status(201).send({ message: i18n.__(`Successful registration`) });

								}else{
									// FUE APROBACION se actualiza el punto de aprobación  
									// y comparo las demas para dejar el pedido parobado o no
									//console.log(token_approval);
									//console.log(now_approval);
									let update_approval = await workPermitApprovalPointModel.update(
										{							
											status: 'A',
											token: token_approval,
											date_approval_point: now_approval									
										},
										{
											where: {
												id: id_work_permit_state_approval
											}
										}
									);
		
									const { QueryTypes } = require('sequelize');
									let dataApprovalPoint = await db.sequelize.query(
										' SELECT id_work_permit_state , '
										+ ' count(id) as totales, '
										+ ' sum(case when  `status` =\'A\' then 1 else 0 end) as aprobados, '
										+ ' sum(case when  `status` =\'R\' then 1 else 0 end) as rechazados, '
										+ ' sum(case when  `status` =\'I\' then 1 else 0 end) as inciaiales '
										+ ' FROM `work_permit_approval_point` '
										+ ' where id_work_permit_state = :id_wp '
										+ ' group by id_work_permit_state ',								
										{
											replacements: { id_wp: id_work_permit_state_WP },                    
											raw: true,
											type: QueryTypes.SELECT
										}
									);
		
									//console.log(id_work_permit_state_WP);
		
									if (!dataApprovalPoint) {
										return response.status(409).send({ message: i18n.__(`Error in the request`) });
									}else{
										//console.log(dataApprovalPoint);
										let totales = dataApprovalPoint[0].totales;
										let aprobados = dataApprovalPoint[0].aprobados;
										let rechazados = dataApprovalPoint[0].rechazados;
										let inciaiales = dataApprovalPoint[0].inciaiales;
		
										//console.log(totales);
										//console.log(aprobados);
										//console.log(rechazados);
										//console.log(inciaiales);
		
										if ( (totales == aprobados) && (inciaiales == 0) && (rechazados == 0 ) ) {
											// Solo en este caso que ya todos contestaros que no hay estado en inciales y no hay rechazados
											// actualizo el pedido a aprobado
											// Se actualiza el estado real del pedido
												stateReal = 6;										

												let update = await workPermitModel.update(
													{							
														id_state: stateReal
													},
													{
														where: {
															id: id_WP
														}
													}
												);
												if (!update[0]) {
													return response.status(404).send({ message: i18n.__(`No records updated %s`) });
												}

												if ( id_usuario_modi != 0 && id_usuario_rol_modi != 0 ){
													//Se ingresa el insert de Estado Inicial del Permiso					
													const now = moment();
													let token = uuidv4();
													let log = new workPermitStateModel ({
														id_work_permit: id_WP,
														id_user: id_usuario_modi,
														id_rol: id_usuario_rol_modi,
														status: 'A',
														token: token,
														justification : 'TODOS APROBARON MODIFICACION', 
														date_state: now,						
														created_at: now											  
													});
										
													log.save((error, logDb) => {
														if (error) {
															console.error(error);
														}
													});
		
													let datarespuesta = await enviarcorreo(id_WP, 'Aprobado' , 'El permiso de Trabajo fue Aprobado por todos los usuarios','Permiso Aprobado',wp_estate);

												} 
										}
										return response.status(201).send({ message: i18n.__(`Successful registration`) });										
									}
						
								}
							}else{
								return response.status(409).send({ message: i18n.__(`Error in the request`) });
							}		
						}else{
							return response.status(409).send({ message: i18n.__(`Error in the request`) });
						}					
					}else{
						//APROBACIÖN NORMAL!!!!!
						// Si trae Instrucciones especiales se busca el WP y se actualiza.
						if(body.hasOwnProperty('instructions_specials')){
							if ( body.instructions_specials != [] ) {
								instructions_specials = body.instructions_specials;													
							}
						}

						let update = await workPermitModel.update(
							{
								special_instructions: instructions_specials,
								id_state: stateReal,
								status: status_original
							},
							{
								where: {
									id: id_WP
								}
							}
						);
				
						if (!update[0]) {
							return response.status(404).send({ message: i18n.__(`No records updated %s`) });
						}		

						//Se ingresa el insert de Estado Inicial del Permiso					
						const now = moment();
						let token = uuidv4();

						let log = new workPermitStateModel ({
							id_work_permit: id_WP,
							id_user: request.user.id,
							id_rol: request.user.idRol,
							status: body.status,
							token: token,
							justification : justificationIN, 
							date_state: now,						
							created_at: now											  
						});
			
						log.save((error, logDb) => {
							if (error) {
								console.error(error);
							}
						});

						
						if(stateReal == 7){								
							let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Jefe de Área',justificationIN,wp_estate);
						}else{
							// BUSCO TODOS LOS PREVENCIONISTAS DE RIESGO PARA MANDAR CORREOS									
							let datapermiso = await workPermitModel.findOne({			
							attributes: [
								'id','id_plant','work_permit_code'
							],
							where: {
								id: id_WP							
							}
							});
													
							if (!datapermiso) {
								return response.status(409).send({ message: i18n.__(`Error in the request`) });
							}else{
								let id_plantaIN = datapermiso.id_plant;
								let cod_PW = datapermiso.work_permit_code;

								let dataActor = await plantPreventionistModel.findAll({			
									include: [				
										{
											attributes: [
												'id', 'email'
											],
											model: usersModel,
											required: true
										}
									],
									where: {
										id_plant: id_plantaIN,
										status: '1'
									}
								});

								for (var i=0; i < dataActor.length; i++) {						
									//console.log(dataActor[i].users_model.email);

									//consiguio el Executor
									let correo = dataActor[i].users_model.email;
									let codigowhitzeros  =  cod_PW; //zeroPad(cod_PW, 8);						
									//console.log(correo);
													
									let mailOptions = {
										to: correo,
										subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
										text: i18n.__(`The work permit has been {{texto}} by the Manager Area, Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application for review.`,{codigo:codigowhitzeros, texto:texto_correo})
									};
									sendEmail(mailOptions, 2);

								}

							}

						}							

						return response.status(201).send({ message: i18n.__(`Successful registration`) });							
					}
			}else{
				return response.status(409).send({ message: i18n.__(`Error in the request`) });
			}				
		}else{
			return response.status(409).send({ message: i18n.__(`Error in the request`) });
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

exports.aprobacionPreventionist = async (request, response) => {
	try {
		let body = request.body;				
		let wp_estate = 4;
		let id_WP = '';
		let justificationIN = null;
		let worked_days= null;
		let days_not_worked= null; 
		let work_days_description= null;
		let stateReal = 6;
		let texto_correo = 'Aprobado';
		let status_original = '1';

		if( (body.hasOwnProperty('id_workpermit')) && (body.hasOwnProperty('status')) ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			if ( id_WP != '' ) {
				// Si trae justificacion se busca y se Guarda.
				if(body.hasOwnProperty('justification') && (body.status == "R") ){
					stateReal = 7;
					status_original = '0';
					texto_correo = 'Rechazado';
					if ( body.justificationIN != [] ) {	
						justificationIN = body.justification;
					}
				}											

					let update = await workPermitModel.update(
						{						
							id_state: stateReal,
							status: status_original
						},
						{
							where: {
								id: id_WP
							}
						}
					);						

					if (!update[0]) {
						return response.status(404).send({ message: i18n.__(`No records updated %s`) });
					}																						

					//Se ingresa el insert de Estado del Permiso					
					const now = moment();
					let token = uuidv4();

					let log = new workPermitStateModel ({
						id_work_permit: id_WP,
						id_user: request.user.id,
						id_rol: request.user.idRol,
						status: body.status,
						token: token,
						justification : justificationIN, 
						date_state: now,						
						created_at: now											  
					});
		
					log.save((error, logDb) => {
						if (error) {
							console.error(error);
						}
					});
					
					if(stateReal == 7){								
						let datarespuesta = await enviarcorreo(id_WP, 'Rechazado' , 'El permiso de Trabajo fue rechazado por el Prevencionista',justificationIN, wp_estate);
					}else{
						let datarespuesta = await enviarcorreo(id_WP, 'Aprobado' , 'El permiso de Trabajo fue Aprobado por todos los usuarios','Permiso Aprobado',wp_estate);
					}

					return response.status(201).send({ message: i18n.__(`Successful registration`) });
					
				}
				
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

// MODIFICAR DE LOS DIFERENTES ACTORES
exports.modifyWorkPermit = async (request, response) => {
	try {
		let body = request.body;				
		let new_code = 0;
		let new_id = '';
		let id_WP = 0;		
		const now = moment();
		let dataActual;
		let stateReal = 3;

		if(body.hasOwnProperty('workPermit') &&  body.hasOwnProperty('workPermit_id') ){
									
			id_WP =  body.workPermit_id;
				
				//BUSCO LA DATA ACTUAL PARA COLOCARLA COMO VALOR ANTERIOR
				let id = body.workPermit_id;

				let dataworkPermit = await workPermitModel.findOne({			
				include: [				
					{
						attributes: [
							'id', 'id_rol','names','sur_names', 'email'
						],
						model: usersModel,
						required: true
					},
					{
						attributes: [
							'id', 'name'
						],
						model: plantModel,
						required: true
					},		
					{
						attributes: [
							'id', 'name'
						],
						model: areasModel,
						required: true
					},
					{
						attributes: [
							'id', 'id_area','name'
						],
						model: equipmentOrMachinesModel,
						required: true
					},
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_area','id_user'
						],
						model: areaManagerModel,
						required: true
					},			
					{
						attributes: [
							'id','name','direction','responsable_person','email'
						],
						model: contractorCompanyModel,
						required: true
					},	
					{
						include: [				
							{
								attributes: [
									'id', 'id_rol','names','sur_names', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						attributes: [
							'id', 'id_user'
						],
						model: contractorCompanyExecutorModel,
						required: true
					},	
				],
				attributes: [
					'id', 'id_user', 'id_plant', 'id_area', 'id_area_manager', 'id_equipment', 'id_contractor_company', 'id_work_executor', 'work_permit_code', 'date_start', 'date_end', 'time_start', 'time_end', 'work_description', 'number_people', 'number_cards', 'protective_elements_other', 'special_instructions','worked_days', 'days_not_worked' , 'work_days_description'
				],
				where: {
					id: id,
					status: '1'
				}
				});

				let dataTypesOfWork = await workPermitTypesOfWorkModel.findAll({					
					include: [
						{
							attributes: [
								'id', 'name'
							],
							model: typesOfWorkModel,
							required: false
						}
					],
					attributes: [
						'id', 'id_work_permit', 'id_type_of_work'
					],
					where: {
						id_work_permit: id,
						status: '1'
					}
				});

				let dataProtectiveElements = await workPermitProtectiveElementsModel.findAll({					
					include: [
						{
							attributes: [
								'id', 'name'
							],
							model: protectiveElementsModel,
							required: false
						}
					],
					attributes: [
						'id', 'id_work_permit','id_protective_elements'
					],
					where: {
						id_work_permit: id,
						status: '1'
					}
				});	

				let dataMandatoryControls = await workPermitMandatoryControlsModel.findAll({					
					include: [
						{
							attributes: [
								'id', 'name'
							],
							model: mandatoryControlsModel,
							required: false
						}
					],
					attributes: [
						'id', 'id_work_permit','id_mandatory_controls'
					],
					where: {
						id_work_permit: id,
						status: '1'
					}
				});	

				let dataEndWork = await workPermitEndWorkModel.findAll({					
					include: [
						{
							attributes: [
								'id', 'name'
							],
							model: endWorkModel,
							required: false
						}
					],
					attributes: [
						'id', 'id_work_permit','id_end_work'
					],
					where: {
						id_work_permit: id,
						status: '1'
					}
				});	
				
				let dataStates= await workPermitStateModel.findAll({					
					include: [
						{
							attributes: [
								'id', 'id_rol','names','sur_names', 'email'
							],
							model: usersModel,
							required: true
						}
					],
					attributes: [
						'id', 'id_work_permit', 'id_user', 'id_rol', 'status', 'date_state','token','justification'
					],
					where: {
						id_work_permit: id				
					}
				});	

				const { QueryTypes } = require('sequelize');
				let dataApprovalPoint = await db.sequelize.query(
					'Select wkap.id_work_permit_state, wkap.id_user, wkap.status, wkap.token, wkap.date_approval_point, u.`names`, u.sur_names, u.email, ar.`name` '
					+ ' from work_permit_state wps join work_permit_approval_point wkap on wkap.id_work_permit_state = wps.id '
					+ ' LEFT JOIN users u on wkap.id_user = u.id '
					+ ' left JOIN user_roles ar on u.id_rol = ar.id '
					+ ' where wps.id_work_permit = :id_wp '
					+ ' and wps.`status`=\'M\';', 
					{
						replacements: { id_wp: id },                    
						raw: true,
						type: QueryTypes.SELECT
					}
				);
				
				if (dataworkPermit) {				
					dataActual = {
						workPermit: dataworkPermit,
						workPermitTypesOfWork: dataTypesOfWork,
						workPermitProtectiveElements: dataProtectiveElements,
						workPermitMandatoryControls: dataMandatoryControls,
						workPermitEndWork: dataEndWork
					};				
				}	
				
				if (request.user.idRol == 3 ) {  //Prevencionista de Riesgo
					stateReal = 5;
				}

			//ACTUALIZO LOS DATOS NUEVOS
			let update = await workPermitModel.update(
				{					
					id_plant: body.workPermit.id_plant,
					id_area: body.workPermit.id_area,
					id_area_manager: body.workPermit.id_area_manager,
					id_equipment: body.workPermit.id_equipment,
					id_contractor_company: body.workPermit.id_contractor_company,
					id_work_executor: body.workPermit.id_work_executor,
					id_state: stateReal,
					date_start: body.workPermit.date_start,
					date_end: body.workPermit.date_end,
					time_start: body.workPermit.time_start,
					time_end: body.workPermit.time_end,
					work_description: body.workPermit.work_description,
					number_people: body.workPermit.number_people,
					number_cards: body.workPermit.number_cards,
					protective_elements_other: body.workPermit.protective_elements_other,
					special_instructions: body.workPermit.special_instructions,
					worked_days: body.workPermit.worked_days,
					days_not_worked: body.workPermit.days_not_worked,
					work_days_description: body.workPermit.work_days_description									
				},
				{
					where: {
						id: id_WP
					}
				}
			);
		
			// Si actualizo entro y verifico los demas datos del permiso
			if ( update == 1 ) {
				
				if(body.hasOwnProperty('workPermitTypesOfWork')){
					let  tipos_wp = body.workPermitTypesOfWork;
					
					let updatePT_TW = await workPermitTypesOfWorkModel.update(
						{
							status: '0',
							deleted_at: now,															
						},
						{
							where: {
								id_work_permit: id_WP,								
								id_type_of_work: { [Op.notIn]: tipos_wp }
							}
						}
					);
										
					for (var i=0; i < tipos_wp.length; i++) {
						//console.log(tipos_wp[i] + " / ");				
						let [data, created] = await workPermitTypesOfWorkModel.findOrCreate({	
							where: {
								id_work_permit: id_WP,
								id_type_of_work: tipos_wp[i],
							},			
							defaults: {
								id_work_permit: id_WP,
								id_type_of_work: tipos_wp[i],
								status: '1'							
							}							
							});
							//console.log(data);
					}

				}	

				if(body.hasOwnProperty('workPermitProtectiveElements')){
					if ( body.workPermitProtectiveElements != [] ) {						
						let  tipos_wp = body.workPermitProtectiveElements;

						let updatePT_PE = await workPermitProtectiveElementsModel.update(
							{
								status: '0',
								deleted_at: now,															
							},
							{
								where: {
									id_work_permit: id_WP,								
									id_protective_elements: { [Op.notIn]: tipos_wp }
								}
							}
						);

						for (var i=0; i < tipos_wp.length; i++) {
							//console.log(tipos_wp[i] + " * ");								
							let [data, created] = await workPermitProtectiveElementsModel.findOrCreate({	
							where: {
								id_work_permit: id_WP,
								id_protective_elements: tipos_wp[i],
							},			
							defaults: {
								id_work_permit: id_WP,
								id_protective_elements: tipos_wp[i],
								status: '1'						
								}							
							});
							//console.log(created);
						}
					}
				}				

				if(body.hasOwnProperty('workPermitMandatoryControls')){
					if ( body.workPermitMandatoryControls != [] ) {						
						let  tipos_wp = body.workPermitMandatoryControls;
						
						let updatePT_MC = await workPermitMandatoryControlsModel.update(
							{
								status: '0',
								deleted_at: now,															
							},
							{
								where: {
									id_work_permit: id_WP,								
									id_mandatory_controls: { [Op.notIn]: tipos_wp }
								}
							}
						);

						for (var i=0; i < tipos_wp.length; i++) {
							//console.log(tipos_wp[i] + " - ");
								let [data, created] = await workPermitMandatoryControlsModel.findOrCreate({	
								where: {
									id_work_permit: id_WP,
									id_mandatory_controls: tipos_wp[i],
								},			
								defaults: {
									id_work_permit: id_WP,
									id_mandatory_controls: tipos_wp[i],
									status: '1'					
									}							
								});
								//console.log(created);

						}
					}

				}
				
				if(body.hasOwnProperty('workPermitEndWork')){
					if ( body.workPermitEndWork != [] ) {						
						let  tipos_wp = body.workPermitEndWork;

						let updatePT_EW = await workPermitEndWorkModel.update(
							{
								status: '0',
								deleted_at: now,															
							},
							{
								where: {
									id_work_permit: id_WP,								
									id_end_work: { [Op.notIn]: tipos_wp }
								}
							}
						);

						for (var i=0; i < tipos_wp.length; i++) {
							//console.log(tipos_wp[i] + " + ");
							let [data, created] = await workPermitEndWorkModel.findOrCreate({	
							where: {
								id_work_permit: id_WP,
								id_end_work: tipos_wp[i],
							},			
							defaults: {
								id_work_permit: id_WP,
								id_end_work: tipos_wp[i],
								status: '1'							
								}							
							});
							//console.log(created);
						}
					}

				}
				
				let token = uuidv4();
				let dataoldTXT = JSON.stringify(dataActual);

				const inserted = await workPermitStateModel.create(
				{ 
					id_work_permit: id_WP,
					id_user: request.user.id,
					id_rol: request.user.idRol,
					status: 'M',
					token: token,
					old_state: dataoldTXT,
					date_state: now,						
					created_at: now	
					}
					);
				
				if (inserted) {
					//console.log(inserted.id);
					
					let workPermitStatenew = inserted.id;
					let codigowhitzeros  =  dataworkPermit.work_permit_code; //zeroPad(dataworkPermit.work_permit_code, 8);

					//Se procese a crear el punto de Aprobación de los actores involucrados
					//para que aprueben o rechacen							
						const insertedsolitante = await workPermitApprovalPointModel.create(
						{ 
							id_work_permit_state: workPermitStatenew,
							id_user: dataworkPermit.id_user, //SOLICITANTE
							created_at: now	
						});

						//Se envia el Correo al SOLICITANTE para que apruebe el Permiso
						
						// BUSCO EL SOLICITANTE 
						let dataSolicitante = await usersModel.findOne({
							attributes: [
								'id', 'id_rol','names','sur_names', 'email','password'
							],											
							where: {
								id: body.workPermit.id_user,
								status: '1'
							}
						});										
						if (!dataSolicitante) {
							//return response.status(404).send({ message: i18n.__(`No records %s`) });
						}
						else {
							//consiguio el SOLICITANTE
							let correo = dataSolicitante.email;																
							
							//correo = 'moracool@gmail.com';
							//console.log('solicitante');
							//console.log(correo);			
							let mailOptions = {
								to: correo,
								subject: i18n.__(`Modified Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
								text: i18n.__(`A work permit has been modified, needs your approval/rejection. Code: <b>{{codigo}}</b>. <br><br>Enter the Mobile Application for review.`,{codigo:codigowhitzeros})
							};
							sendEmail(mailOptions, 2);

						}			
					
						//Se envia el Correo al Executor para que apruebe el Permiso
						// BUSCO EL EXECUTOR SELECCIONADO 
						let dataExecutor = await contractorCompanyExecutorModel.findOne({
							include: [				
								{
									attributes: [
										'id', 'id_rol','names','sur_names', 'email','password'
									],
									model: usersModel,
									required: true
								}
							],						
							where: {
								id: body.workPermit.id_work_executor,
								status: '1'
							}
						});										
						//console.log(dataExecutor);
						if (!dataExecutor) {
							//return response.status(404).send({ message: i18n.__(`No records %s`) });
						}
						else {
							const insertedexecutor = await workPermitApprovalPointModel.create(
								{ 
									id_work_permit_state: workPermitStatenew,
									id_user: dataExecutor.users_model.id, //EXECUTOR
									created_at: now	
								});

								
							//consiguio el Executor
							let correo = dataExecutor.users_model.email;								
							let tokenExecutor = dataExecutor.users_model.password;
							//console.log('ejecutor');
							//console.log(correo);
							//correo = 'moracool@gmail.com';					
							let mailOptions = {
								to: correo,
								subject: i18n.__(`Modified Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
								text: i18n.__(`A work permit has been modified, needs your approval/rejection. Code: <b>{{codigo}}</b>. <br><br>To enter the Mobile Application use your access token: <b>{{token}}</b>`,{codigo:codigowhitzeros, token: tokenExecutor})
							};
							sendEmail(mailOptions, 2);
						}

						if (request.user.idRol == 3 ) {  //Prevencionista de Riesgo							
							// BUSCO EL JEFE DE AREA SELECCIONADO 
							let dataArea_manager = await areaManagerModel.findOne({
								include: [				
									{
										attributes: [
											'id', 'id_rol','names','sur_names', 'email','password'
										],
										model: usersModel,
										required: true
									}
								],						
								where: {
									id: body.workPermit.id_area_manager,
									status: '1'
								}
							});																									
							if (!dataArea_manager) {
								//return response.status(404).send({ message: i18n.__(`No records %s`) });
							}
							else {
								//consiguio el Executor
								const insertedmanagerarea = await workPermitApprovalPointModel.create(
									{ 
										id_work_permit_state: workPermitStatenew,
										id_user: dataArea_manager.users_model.id, //Jefe de Area
										created_at: now	
									});
									
								let correo = dataArea_manager.users_model.email;																
								//console.log('jefe de area');
								//console.log(correo);
								//correo = 'moracool@gmail.com';					
								let mailOptions = {
									to: correo,
									subject: i18n.__(`Modified Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
									text: i18n.__(`A work permit has been modified, needs your approval/rejection. Code: <b>{{codigo}}</b>. <br><br>Enter the Mobile Application for review.`,{codigo:codigowhitzeros})
								};
								sendEmail(mailOptions, 2);
							}

						}
				}	

				return response.status(201).send({ message: i18n.__(`Successful registration`) });
			}else{
				return response.status(404).send({ message: i18n.__(`No records updated %s`) });
			}				
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

// TERMINAR TRABAJO
exports.endWorkPermit = async (request, response) => {
	try {
		let body = request.body;				
		let new_code = 0;
		let id_WP = '';
		let stateReal = 8;		

		//		return response.status(201).send({ message: i18n.__(`entro`) });
		
		if( body.hasOwnProperty('id_workpermit') ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			if ( id_WP != '' ) {			
					// Si trae justificacion se busca y se Guarda.
					let update = await workPermitModel.update(
						{							
							id_state: stateReal
						},
						{
							where: {
								id: id_WP
							}
						}
					);
			
					if(body.hasOwnProperty('workPermitEndWork')){
						if ( body.workPermitEndWork != [] ) {						
							let  tipos_wp = body.workPermitEndWork;
							for (var i=0; i < tipos_wp.length; i++) {
								//console.log(tipos_wp[i] + " + ");
								const inserted = await workPermitEndWorkModel.create(
									{ 
										id_work_permit: id_WP,
										id_end_work: tipos_wp[i]
									 }
									 );
							}
						}

					}

					if (!update[0]) {
						return response.status(404).send({ message: i18n.__(`No records updated %s`) });
					}		
					
					//Se ingresa el insert de Estado Inicial del Permiso					
					const now = moment();
					let token = uuidv4();
					let log = new workPermitStateModel ({
						id_work_permit: id_WP,
						id_user: request.user.id,
						id_rol: request.user.idRol,
						status: 'T',
						token: token,						
						date_state: now,						
						created_at: now											  
					});
		
					log.save((error, logDb) => {
						if (error) {
							console.error(error);
						}
					});

					// BUSCO TODOS LOS PREVENCIONISTAS DE RIESGO PARA MANDAR CORREOS									
					let datapermiso = await workPermitModel.findOne({			
						attributes: [
							'id','id_plant','work_permit_code'
						],
						where: {
							id: id_WP,
							status: '1'
						}
					});
					
					let id_plantaIN = datapermiso.id_plant;
					let cod_PW = datapermiso.work_permit_code;

					let dataActor = await plantPreventionistModel.findAll({			
						include: [				
							{
								attributes: [
									'id', 'email'
								],
								model: usersModel,
								required: true
							}
						],
						where: {
							id_plant: id_plantaIN,
							status: '1'
						}
					});
					
					for (var i=0; i < dataActor.length; i++) {						
						//console.log(dataActor[i].users_model.email);

						//consiguio el Executor
						let correo = dataActor[i].users_model.email;
						let codigowhitzeros  = cod_PW;						
						//console.log(correo);
										
						let mailOptions = {
							to: correo,
							subject: i18n.__(`Revision Work Permit, Code: {{codigo}}`, {codigo:codigowhitzeros}),
							text: i18n.__(`The work permit was updated, the executor filled out the End Work. Code: <b>{{codigo}}</b>. <br><br>Please enter the Mobile Application to complete the Daily Log.`,{codigo:codigowhitzeros})
						};
						sendEmail(mailOptions, 2);

					}
					return response.status(201).send({ message: i18n.__(`Successful registration`) });
										
				}
				
		}
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

//CULMINAR TRABAJO
exports.dailyLogWorkPermit = async (request, response) => {
	try {
		let body = request.body;				
		let id_WP = '';
		let stateReal = 9;
		let worked_days= null;
		let days_not_worked= null; 
		let work_days_description= null;	

		if( body.hasOwnProperty('id_workpermit') ){			
			//return response.status(201).send({ message: i18n.__(`Successful registration`) });
			id_WP = body.id_workpermit;

			if ( id_WP != '' ) {			
					// Si trae justificacion se busca y se Guarda.
					worked_days= body.worked_days; 
					days_not_worked= body.days_not_worked; 
					work_days_description = body.work_days_description; 
					//}
									
					let update = await workPermitModel.update(
						{
							worked_days: worked_days,									
							days_not_worked: days_not_worked,
							work_days_description: work_days_description,					
							id_state: stateReal
						},
						{
							where: {
								id: id_WP
							}
						}
					);
								
					if (!update[0]) {
						return response.status(404).send({ message: i18n.__(`No records updated %s`) });
					}		
					
					//Se ingresa el insert de Estado Inicial del Permiso					
					const now = moment();
					let token = uuidv4();
					let log = new workPermitStateModel ({
						id_work_permit: id_WP,
						id_user: request.user.id,
						id_rol: request.user.idRol,
						status: 'C',
						token: token,						
						date_state: now,						
						created_at: now											  
					});
		
					log.save((error, logDb) => {
						if (error) {
							console.error(error);
						}
					});
					
					return response.status(201).send({ message: i18n.__(`Successful registration`) });
										
				}				
		}		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

//Buscar los datos por el QR
exports.getHistoryByQR = async (request, response) => {
	try {		
		const promiseInvoices = [];
		let cod_pedido = request.params.codigo;		
		const { QueryTypes } = require('sequelize');
		let queryy = ''; 

		let datadevolver = await workPermitStateModel.findAll({						
			include: [
				{
					attributes: [
						'id', 'id_rol','names','sur_names', 'email'
					],
					model: usersModel,
					required: true
				},				
				{    
					include: [										
						{
							attributes: [
								'id', 'name'
							],
							model: statesWorkPermitModel,
							required: true
						}
						], 							
					model: workPermitModel,
					required: true,
					where: {
						work_permit_code : cod_pedido,
						id_state: {
							[Op.gte]: 6  
						  }						      
					},					
				},										
				{       
					attributes: [
						'id', 'name' , 'description'
					],  
					model: userRolesModel,
					required: true,
				}
			],	
			where: {
				[Op.or]: [
				  { status: 'A' },
				  { status: 'S' }
				]		

			  },	
			order: [
				['created_at', 'DESC']
			],
		});
		
		if ( datadevolver.length == 0){
			//VERFICO SI ES QUE EL ESTADO ES MENOR
			let verificando = await workPermitModel.findOne({			
				attributes: [
					'id'
				],
				where: {
					work_permit_code : cod_pedido,
					id_state: {
						[Op.lt]: 6  
					  }						      
				}
				});
				
				if (verificando) {
					return response.status(404).send({ message: i18n.__(`Work Permit is in the approval process.`) });
				}else{
					return response.status(404).send({ message: i18n.__(`No records %s`) });
				}
				
		}
		if (!datadevolver ) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {	
			return response.status(200).send(datadevolver);
		}			
		
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

const include = [
	{
		attributes: ['id',  'names', 'sur_names', 'email', 'phone_number', 'status', 'created_at', 'updated_at'],
		model: usersModel,
		required: false,
		include: [
			{
				model: userRolesModel,
				required: false
			}
		]
	},
	{
		//attributes: ['id', 'name'],
		model: plantModel,
		required: false
	},
	{
		//attributes: ['id', 'name'],
		model: areasModel,
		required: false
	},
	{
		//attributes: ['id', 'name'],
		model: areaManagerModel,
		required: false,
		include: [
			{
				attributes: ['id',  'names', 'sur_names', 'email', 'phone_number', 'status', 'created_at', 'updated_at'],
				model: usersModel,
				required: false,
				include: [
					{
						model: userRolesModel,
						required: false
					}
				]
			},
			{
				model: areasModel,
				required: false
			},
		]
	},
	{
		//attributes: ['id', 'name'],
		model: equipmentOrMachinesModel,
		required: false
	},
	{
		//attributes: ['id', 'name'],
		model: contractorCompanyModel,
		required: false
	}
];

const query = async (id) => {
	let data = await workPermitModel.findByPk(id, {
		include: include
	});

	if (data) {
		data.dataValues.typesOfWork = await workPermitTypesOfWorkModel.findAll({
			include: [
				{
					attributes: ['id', 'name'],
					model: typesOfWorkModel,
					required: false
				}
			],
			attributes: ['id', 'id_work_permit', 'id_type_of_work'],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});

		data.dataValues.protectiveElements = await workPermitProtectiveElementsModel.findAll({
			include: [
				{
					attributes: ['id', 'name'],
					model: protectiveElementsModel,
					required: false
				}
			],
			attributes: ['id', 'id_work_permit','id_protective_elements'],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});

		data.dataValues.mandatoryControls = await workPermitMandatoryControlsModel.findAll({
			include: [
				{
					attributes: ['id', 'name'],
					model: mandatoryControlsModel,
					required: false
				}
			],
			attributes: ['id', 'id_work_permit','id_mandatory_controls'],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});

		data.dataValues.endWork = await workPermitEndWorkModel.findAll({
			include: [
				{
					attributes: ['id', 'name'],
					model: endWorkModel,
					required: false
				}
			],
			attributes: ['id', 'id_work_permit','id_end_work'],
			where: {
				id_work_permit: id,
				status: '1'
			}
		});

		data.dataValues.states= await workPermitStateModel.findAll({
			include: [
				{
					attributes: ['id', 'id_rol','names','sur_names', 'email'],
					model: usersModel,
					required: true
				}
			],
			attributes: ['id', 'id_work_permit', 'id_user', 'id_rol', 'status', 'date_state','token','justification','old_state'],
			where: {
				id_work_permit: id
			}
		});

		data.dataValues.approvalPoint = await db.sequelize.query(
			`
				SELECT wkap.id_work_permit_state, wkap.id_user, wkap.status, wkap.token, wkap.date_approval_point, u.names, u.sur_names, u.email, ar.name
				FROM work_permit_state wps JOIN work_permit_approval_point wkap ON wkap.id_work_permit_state = wps.id
				LEFT JOIN users u ON wkap.id_user = u.id
				LEFT JOIN user_roles ar ON u.id_rol = ar.id
				WHERE wps.id_work_permit = :id_wp
				AND wps.status=\'M\';
			`,
			{
				replacements: { id_wp: id },
				raw: true,
				type: QueryTypes.SELECT
			}
		);
	}

	return data;
}

exports.downloadReport = async (request, response) => {
	try {
		let id = request.params.id;

		let data = await query(id);

		if (!data) {
			return response.status(404).send({ message: i18n.__(`No records %s`) });
		}
		else {
			let html = await templateHtml(data);

			let options = {
				margin: {
					top: 32,
					right: 16,
					bottom: 32,
					left: 16
				},
				format: 'A4',
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			};

			let file = {
				content: html
			};

			html_to_pdf.generatePdf(file, options)
				.then((data) => {
					return response.status(200).send({ data });
					// return response.status(200).end(data);
				});
		}
	}
	catch (error) {
		utilities.error500(response, error);
	}
}

const templateHtml = async (data) => {

	let typesOfWork = data.dataValues?.typesOfWork;
	if (typesOfWork.length > 0) {
		typesOfWork = utilities.arrayToString(
			typesOfWork.map((val) => {
				return `${val.types_of_work_model?.name}`;
			}),
			'<br>'
		);
	}

	let protectiveElements = data.dataValues?.protectiveElements;
	if (protectiveElements.length > 0) {
		protectiveElements = utilities.arrayToString(
			protectiveElements.map((val) => {
				return `${val.protective_elements_model?.name}`;
			}),
			'<br>'
		);
	}

	let mandatoryControls = data.dataValues?.mandatoryControls;
	if (mandatoryControls.length > 0) {
		mandatoryControls = utilities.arrayToString(
			mandatoryControls.map((val) => {
				return `${val.mandatory_controls_model?.name}`;
			}),
			'<br>'
		);
	}

	let states = data.dataValues?.states;
	if (states.length > 0) {
		states = utilities.arrayToString(
			states.map((val) => {
				return `
					<b>Estatus:</b> ${val.status}
					-
					<b>Nombres:</b> ${val.users_model?.names} ${val.users_model?.sur_names}
					-
					<b>Fecha:</b> ${moment(data.date_state).format('DD/MM/YYYY hh:mm A')}
					-
					<b>Token:</b> ${val.token}
					-
					<b>Justification:</b> ${val.justification}
				`;
			}),
			'<br>'
		);
	}

	let approvalPoint = data.dataValues?.approvalPoint;
	if (approvalPoint.length > 0) {
		approvalPoint = utilities.arrayToString(
			approvalPoint.map((val) => {
				return `
					<b>Estatus:</b> ${val.status}
					-
					<b>Nombres:</b> ${val.names} ${val.sur_names}
					-
					<b>Fecha:</b> ${moment(data.date_approval_point).format('DD/MM/YYYY hh:mm A')}
					-
					<b>Token:</b> ${val.token}
				`;
			}),
			'<br>'
		);
	}

	let templateHtml = `
		<h2 style="color: ${environments.themeColor};">
			PERMISO DE TRABAJO SEGURO
		</h2>
		<hr color="${environments.themeColor}">
		<table
			style="
				background-color: #FFFFFF;
				color: #000000;
				font-size: 16px;
				line-height: 2rem;
				margin: auto;
				width: 100%;
			"
			border="0"
			cellpadding="12"
			cellspacing="0"
		>
			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						TIPO DE TRABAJO PARA EL CUAL SOLICITA PERMISO
					</h3>
					${typesOfWork}
					<hr color="${environments.themeColor}">
				</td>
			</tr>

			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						DATOS A COMPLETAR POR SOLICITANTE DE LA TAREA
					</h3>

					<b>Código</b>: ${data.id}
					<br>

					<b>Responsable de empresa contratista:</b> ${data.contractor_company_model?.responsable_person}
					<br>

					<b>Planta o recinto</b>: ${data.plant_model?.name}
					<br>

					<b>Fecha de inicio</b>: ${moment(data.date_start).format('DD/MM/YYYY')}
					-
					<b>Fecha de término</b>: ${moment(data.date_end).format('DD/MM/YYYY')}
					<br>

					<b>Hora de inicio:</b> ${moment(data.time_start, 'HH:mm:ss').format('LT')}
					-
					<b>Hora de término:</b> ${moment(data.time_end, 'HH:mm:ss').format('LT')}
					<br>

					<b>Responsable de área donde se ejecuta el trabajo:</b>
					${data.area_manager_model?.users_model?.names}
					${data.area_manager_model?.users_model?.sur_names}
					<br>

					<b>Descripción de la tarea:</b> ${data.work_description}
					<br>

					<b>N° de persona involucradas en la tarea:</b> ${data.number_people}
					<br>

					<b>Cantidad de tarjetas o candados de bloqueo:</b> ${data.number_cards}

					<hr color="${environments.themeColor}">
				</td>
			</tr>

			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						ELEMENTOS DE PROTECCIÓN PERSONAL
					</h3>
					${mandatoryControls}
					<hr color="${environments.themeColor}">
				</td>
			</tr>

			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						CONTROLES OBLIGATORIOS
					</h3>
					${protectiveElements}
					<hr color="${environments.themeColor}">
				</td>
			</tr>

			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						ESTADOS
					</h3>
					${states}
					<hr color="${environments.themeColor}">
				</td>
			</tr>

			<tr>
				<td>
					<h3 style="color: ${environments.themeColor};">
						PUNTO DE APROBACIÓN
					</h3>
					${approvalPoint}
					<hr color="${environments.themeColor}">
				</td>
			</tr>
		</table>
	`;

	return templateHtml
}


const enviarcorreo = async (id_param, estadoEscrito, textoCorreo, justificationIN, estade_old) => {
	
		let ee = 0;
		const correosEnviar = [];
		//console.log('ENTRO');
		let data = await db.sequelize.query(
		'select  wp.id , wp.id_state,  concat(s.`names`,\' \',s.`sur_names`) as solicitante ,  s.email as email_sol, '
			+ ' concat(ja.`names`,\' \',ja.`sur_names`) as jefe_area , ja.email as email_jefe, '
			+ ' concat(ex.`names`,\' \',ex.`sur_names`) as executor ,  ex.email as email_ex, '
			+ ' (select GROUP_CONCAT( concat(us.`names`,\' \',us.`sur_names`,\'*\',us.email) ) '
			+ ' from  plant_preventionist pv left join `users` us on pv.id_user = us.id '
			+ ' where id_plant = wp.id_plant )  as prevencionistas				 '
			+ ' from work_permit wp left join `users` s on s.id = wp.id_user  '
			+ ' left join `area_manager` am on am.id = wp.id_area_manager  '
			+ ' left join `users` ja on ja.id = am.id_user '
			+ ' left join `contractor_company_executor` cce on cce.id = wp.id_work_executor  '
			+ ' left join `users` ex on ex.id = cce.id_user '
			+ ' where wp.`id` =  :id_userWP ; ',		{
			replacements: { id_userWP: id_param },                    
			raw: true,
			type: QueryTypes.SELECT
		}
		);

		if (!data || (data.length === 0) ) {
			ee = 1;
		}
		else {

			let solicitante = data[0].solicitante;
			let solicitanteCorreo = data[0].email_sol;
			let jefe_area = data[0].jefe_area;
			let jefe_areaCorreo = data[0].email_jefe;
			let executorNOM = data[0].executor;
			let executorCorreo = data[0].email_ex;
			let prevencionistas = data[0].prevencionistas;						
			
			correosEnviar.push( { correo: solicitanteCorreo});

			if  ( (estade_old == 2 ) && (estadoEscrito == 'Rechazado' ) ){
				correosEnviar.push( { correo: executorCorreo});				
			}
			if  ( ( estade_old == 3 || estade_old == 4 ) && (estadoEscrito == 'Rechazado' ) ){
				correosEnviar.push( { correo: executorCorreo});
				correosEnviar.push( { correo: jefe_areaCorreo});				
			}	
			if  ( ( estade_old == 5  ) && (estadoEscrito == 'Rechazado' ) ){
				correosEnviar.push( { correo: executorCorreo});
				correosEnviar.push( { correo: jefe_areaCorreo});				
				if ( (prevencionistas != '') && (prevencionistas != [] ) ) {				
					var string = prevencionistas.split(",");
					for (var i=0; i < string.length; i++) {							
						var stringinternos = string[i].split("*");
						if (stringinternos.length != 0){
							correosEnviar.push( { correo: stringinternos[1]});
						}
					} 
				}
			}		
			
			if  (estadoEscrito == 'Aprobado'){
				correosEnviar.push( { correo: solicitanteCorreo});
				correosEnviar.push( { correo: executorCorreo});
				correosEnviar.push( { correo: jefe_areaCorreo});				
				if ( (prevencionistas != '') && (prevencionistas != [] ) ) {				
					var string = prevencionistas.split(",");
					for (var i=0; i < string.length; i++) {							
						var stringinternos = string[i].split("*");
						if (stringinternos.length != 0){
							correosEnviar.push( { correo: stringinternos[1]});
						}
					} 
				}
			}

			let datawp = await db.sequelize.query(
			'select wp.work_permit_code, p.`name` as planta,  a.`name` as area '
			+ ' from work_permit wp LEFT JOIN plant p on p.id = wp.id_plant '
			+ ' LEFT JOIN areas a on a.id = wp.id_area '
			+ ' where wp.id = :id_wpr; ', 
			{
				replacements: { id_wpr: id_param },                    
				raw: true,
				type: QueryTypes.SELECT
			}
			);

			if (!datawp || (datawp.length === 0) ) {
				ee = 1;
			}else {
				let planta = datawp[0].planta;
				let area = datawp[0].area;
				let work_permit_code = datawp[0].work_permit_code;								
				
				var QRCode = require('qrcode')
				//let img2 = await QRCode.toDataURL('125');
				/*QRCode.toDataURL('125', function (err, url) {
						console.log(url)				
				})*/

				let img = await QRCode.toDataURL(work_permit_code.toString());
				
				
				//Envio de Correos a todos los involucrados
				for (var i=0; i < correosEnviar.length; i++) {	
					//consiguio el Executor
					let correo = correosEnviar[i].correo;
					//console.log(correo);
					//correo = 'lmora@bcnschool.cl';	
					let mailOptions = '';

					if (estadoEscrito == 'Aprobado'){							
						 mailOptions = {
							to: correo,
							subject: i18n.__(` {{estadoEscritop}} Work Permit, Code: {{codigo}}`, {codigo: work_permit_code, estadoEscritop: estadoEscrito}),
							text: i18n.__(`{{texto_correo}}.<br><br> Work permit Code: {{codigo}}<br>Plant: {{plantW}} <br>Area: {{areaW}}<br>Description: {{observacion}}.<br><br>Work Permit QR:<br><img width="200" height="200" src="{{foto}}">`,{texto_correo: textoCorreo, codigo:work_permit_code, plantW:planta ,areaW:area, observacion:justificationIN , foto:img } )							
						};
					}else{					
						 mailOptions = {
							to: correo,
							subject: i18n.__(` {{estadoEscritop}} Work Permit, Code: {{codigo}}`, {codigo: work_permit_code, estadoEscritop: estadoEscrito}),
							text: i18n.__(`{{texto_correo}}.<br><br> Work permit Code: {{codigo}}<br>Plant: {{plantW}} <br>Area: {{areaW}}<br>Description: {{observacion}}.`,{texto_correo: textoCorreo, codigo:work_permit_code, plantW:planta ,areaW:area, observacion:justificationIN} )	
						};
					}
					sendEmail(mailOptions, 2);
				}
				
			}

		}
	return ee;
}

//Buscar los datos por el QR
exports.getQRgenerate = async (request, response) => {
	try {		
			var QRCode = require('qrcode')
			//let img2 = await QRCode.toDataURL('125');
			/*QRCode.toDataURL('125', function (err, url) {
					console.log(url)				
			})*/

			let img = await QRCode.toDataURL('125');
			console.log(img);
			
			QRCode.toFile('assets/qrs/125.png', '125', {
				color: {
				  dark: '#00F',  // Blue dots
				  light: '#0000' // Transparent background
				}
			  }, function (err) {
				if (err) throw err
				console.log('done')
			  })

			let correo = 'lmora@bcnschool.cl';
			let planta = 'TEST'; 
			let area = 'TEST'; 
			let work_permit_code = '125';								
			let estadoEscrito = 'TEST';
			let textoCorreo = 'TEST';
			let justificationIN = 'TEST'; 
			let urlImg = 'assets/qrs/125.png';

			console.log(urlImg);

			let mailOptions = {
				to: correo,
				subject: i18n.__(` {{estadoEscritop}} Work Permit, Code: {{codigo}}`, {codigo: work_permit_code, estadoEscritop: estadoEscrito}),
				text: i18n.__(`{{texto_correo}}.<br><br> Work permit Code: {{codigo}}<br>Plant: {{plantW}} <br>Area: {{areaW}}<br>Description: {{observacion}}.<br><br>Work Permit QR:<br><img width="200" height="200" src="{{foto}}">`,{texto_correo: textoCorreo, codigo:work_permit_code, plantW:planta ,areaW:area, observacion:justificationIN , foto:img } )
			};
			//console.log(mailOptions);

			sendEmail(mailOptions, 2);

		return response.status(201).send({ message: i18n.__(`Successful registration`) });
	}
	catch (error) {
		utilities.error500(response, error);
	}
}
