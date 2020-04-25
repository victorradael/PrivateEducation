const { date } = require('../../lib/utils');
const db = require('../../config/database');

module.exports = {
    all(callback) {

        db.query(`
            SELECT teachers.*, count(students) AS total_students
            FROM teachers
            LEFT JOIN students ON (teachers.id = students.teacher_id)
            GROUP BY teachers.id
            ORDER BY name ASC`, (err, results) => {
            if (err) throw `Database Error "all"! ${err}` 

            callback(results.rows)
        })
    },
    create(data, callback ) {
        const query = `
            INSERT INTO teachers (
                name,
                birth_date,
                educational_level,
                class_type,
                subjects_taught,
                avatar_url,
                created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id
        `

        const values = [
            data.name,
            date(data.birth_date).iso,
            data.educational_level,
            data.class_type,
            data.subjects_taught,
            data.avatar_url,
            date(Date.now()).iso,
        ]

        db.query(query, values, (err, results) => {
            if (err) throw `Database Error "create"! ${err}`

            callback(results.rows[0])
        })
    },
    find(id, callback) {
        db.query(`
            SELECT * 
            FROM teachers 
            WHERE id = $1`, [id], (err, results) => {
                if (err) throw `Database Error! "find" ${err}`

                callback(results.rows[0])
        })
    },
    findBy(filter, callback) {
        db.query(`
        SELECT teachers.*, count(students) AS total_students
        FROM teachers
        LEFT JOIN students ON (teachers.id = students.instructor_id)
        WHERE teachers.name ILIKE '%${filter}%'
        OR teachers.subjects_taught ILIKE '%${filter}%'
        GROUP BY teachers.id
        ORDER BY name ASC`, (err, results) => {
        if (err) throw `Database Error!"findBy" ${err}` 

        callback(results.rows)
    }) 
    },
    update(data, callback) {
        const query = `
            UPDATE teachers SET
            name=($1),
            birth_date=($2),
            educational_level=($3),
            class_type=($4),
            subjects_taught=($5),
            avatar_url=($6)
        WHERE id = $7
        `
        const values = [
            data.name,
            date(data.birth_date).iso,
            data.educational_level,
            data.class_type,
            data.subjects_taught,
            data.avatar_url,
            data.id,
        ]

        db.query(query, values, (err, results) => {
            if (err) throw `Database Error! "update" ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM teachers WHERE id = $1`, [id], (err, results) => {
            if(err) throw `Database Error! "delete" ${err}`

           callback()
        }) 

    },
    paginate(params) {
        const {filter, limit, offset, callback} = params

        let query = "",
            filterQuery = "",
            totalQuery = `
            (
                SELECT count(*) 
                FROM teachers
            ) 
            AS total`

        if(filter) {
            filterQuery = `
                WHERE teachers.name ILIKE '%${filter}%'
                OR teachers.subjects_taught ILIKE '%${filter}%'
            `

            totalQuery = `
            (
                SELECT count(*) FROM teachers
                ${filterQuery}
            ) AS total
            `
        }

        query = `
            SELECT teachers.*, ${totalQuery}, count(students) AS total_students 
            FROM teachers
            LEFT JOIN students ON (teachers.id = students.teacher_id)
            ${filterQuery}  
            GROUP BY teachers.id
            LIMIT $1
            OFFSET $2
        `

        db.query(query, [limit, offset], (err, results) => {
            if(err) throw `Database Error! "paginate" ${err}`

            callback(results.rows)
        })

    }
} 