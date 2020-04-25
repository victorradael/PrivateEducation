const Teacher = require('../models/teacher')
const { age, date } = require('../../lib/utils')

module.exports = {

    index(req, res) {
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 4
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(teachers) {

                const pagination = {
                    total: Math.ceil(teachers[0].total / limit),
                    page
                }

                return res.render("teachers/teachers", { teachers, pagination, filter })
            }
        }

        Teacher.paginate(params)

    },
    show(req, res) {
        Teacher.find(req.params.id, teacher => {
            if (!teacher) return res.send('Teacher Not Found')

            teacher.age = age(teacher.birth_date)
            teacher.subjects_taught = teacher.subjects_taught.split(",")

            teacher.created_at = date(teacher.created_at).format

            return res.render("teachers/show", { teacher })
        })
    },
    create(req, res) {
        return res.render('teachers/create')
    },
    post(req, res) {

        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == "") {
                return res.send(' Please, fill all fields!')
            }
        }

        Teacher.create(req.body, teacher => {
            return res.redirect(`/teachers/${teacher.id}`)
        })

    },
    edit(req, res) {
        Teacher.find(req.params.id, teacher => {
            if (!teacher) return res.send('Teacher Not Found')

            teacher.birth_date = date(teacher.birth_date).iso

            teacher.created_at = date(teacher.created_at).format

            return res.render("teachers/edit", { teacher })
        })
    },
    put(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == "") {
                return res.send(' Please, fill all fields!')
            }
        }

        Teacher.update(req.body, _ => {
            return res.redirect(`/teachers/${req.body.id}`)
        })
    },
    delete(req, res) {
        Teacher.delete(req.body.id, _ => {
            return res.redirect(`/teachers`)
        })
    }

}