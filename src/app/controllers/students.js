const Student = require('../models/student')
const { date } = require('../../lib/utils')

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
            callback(students) {

                const pagination = {
                    total: Math.ceil(students[0].total / limit),
                    page
                }

                return res.render("students/students", { students, pagination, filter })
            }
        }

        Student.paginate(params)

    },
    show(req, res) {
        Student.find(req.params.id, student => {
            if (!student) return res.send('Student Not Found')

            student.birth_date = date(student.birth_date).birthday

            student.created_at = date(student.created_at).format

            return res.render("students/show", { student })
        })
    },
    create(req, res) {

        Student.teacherSelectOptions(options => {
            return res.render('students/create', {teacherOptions: options})
        })
    },
    post(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == "") {
                return res.send(' Please, fill all fields!')
            }
        }

        Student.create(req.body, student => {
            return res.redirect(`/students/${student.id}`)
        })


    },
    edit(req, res) {
        Student.find(req.params.id, student => {
            if (!student) return res.send('Student Not Found')

            student.birth_date = date(student.birth_date).iso

            student.created_at = date(student.created_at).format

            Student.teacherSelectOptions(options => {
                return res.render ('students/edit', {student, teacherOptions: options})
            })

        })
    },
    put(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            if (req.body[key] == "") {
                return res.send(' Please, fill all fields!')
            }
        }

        Student.update(req.body, _ => {
            return res.redirect(`/students/${req.body.id}`)
        })
    },
    delete(req, res) {
        Student.delete(req.body.id, _ => {
            return res.redirect(`/students`)
        })
    },
}






