import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const Env = {
    host: process.env.Server,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.DataBase,
    Port: process.env.Port
}

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: Env.host,
    user: Env.user,
    password: Env.password,
    database: Env.database,
});

connection.connect(function (error) {
    if(error){
        console.log('Ta fallando');
    } else {
        console.log('Si compilo tú');
    }
});

app.listen(Env.Port, () => {
    console.log(`Servidor Iniciando, se escucha en el puerto: ${Env.Port}`);
    console.log("");
});

//Traer todo de la tabla cuando fact_frecuency sea el evento Alto
app.get('/GetArduino', async (req, res) => {
    const value = req.query.value;

    if (!value) {
        return res.status(400).json({ Error: 'El parámetro "value" es requerido' });
    }

    const sql = 'SELECT * FROM Traffic_Light WHERE description_event = ?';

    connection.query(sql, value, async (error, result) => {
        if (error) {
            console.error(`Query ${error}`);
            return res.status(500).json({ Error: 'Query Error' });
        }

        if (result.length > 0) {
            console.log(`Resultado Exitoso`);
            return res.json({ Status: 'Exitoso', Result: result });
        } else {
            console.log('No he traido nada');
            return res.json({ Status: 'Sin datos', Result: result });
        }
    });
});


//Actualizar los datos de un arduino.
app.put('/UpdateArduino', async (req, res) => {
    const id = req.query.id;
    const updatedData = req.body;

    if (!id) {
        return res.status(400).json({ Error: 'El parámetro "id" es requerido' });
    }

    const sql = 'UPDATE Traffic_Light SET ? WHERE id = ?';

    connection.query(sql, [updatedData, id], async (error, result) => {
        if (error) {
            console.error(`Query ${error}`);
            return res.status(500).json({ Error: 'Query Error' });
        }

        if (result.affectedRows > 0) {
            console.log('Actualización Exitosa');
            return res.json({ Status: 'Exitoso', Result: result });
        } else {
            console.log('No se encontró el registro para actualizar');
            return res.json({ Status: 'Sin datos para actualizar', Result: result });
        }
    });
});

// Crear. 
app.post('/CreateArduino', async (req, res) => {
    const newData = req.query;

    if (Object.keys(newData).length === 0) {
        return res.status(400).json({ Error: 'Se requieren parámetros en el cuerpo de la solicitud' });
    }

    const sql = 'INSERT INTO Traffic_Light SET ?';

    connection.query(sql, newData, async (error, result) => {
        if (error) {
            console.error(`Query ${error}`);
            return res.status(500).json({ Error: 'Query Error' });
        }

        console.log('Inserción Exitosa');
        return res.json({ Status: 'Exitoso', Result: result });
    });
});

//Eliminar segun el id
app.delete('/DeleteArduino', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({ Error: 'El parámetro "id" es requerido' });
    }

    const sql = 'DELETE FROM Traffic_Light WHERE id = ?';

    connection.query(sql, id, async (error, result) => {
        if (error) {
            console.error(`Query ${error}`);
            return res.status(500).json({ Error: 'Query Error' });
        }

        if (result.affectedRows > 0) {
            console.log('Eliminación Exitosa');
            return res.json({ Status: 'Exitoso', Result: result });
        } else {
            console.log('No se encontró el registro para eliminar');
            return res.json({ Status: 'Sin datos para eliminar', Result: result });
        }
    });
});

// Segun rangos.
app.get('/GetArduinoByRange', async (req, res) => {
    const min = parseInt(req.query.min);
    const max = parseInt(req.query.max);

    if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({ Error: 'Los parámetros deben ser números válidos' });
    }

    const sql = 'SELECT * FROM Traffic_Light WHERE fact_frecuency BETWEEN ? AND ?';

    connection.query(sql, [min, max], async (error, result) => {
        if (error) {
            console.error(`Query ${error}`);
            return res.status(500).json({ Error: 'Query Error' });
        }

        if (result.length > 0) {
            console.log(`Resultado Exitoso`);
            return res.json({ Status: 'Exitoso', Result: result });
        } else {
            console.log('No he traido nada');
            return res.json({ Status: 'Sin datos', Result: result });
        }
    });
});