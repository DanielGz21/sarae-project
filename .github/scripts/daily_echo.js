const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Iniciando búsqueda de Ecos del Pasado...");

    const today = new Date();
    const monthDay = today.toISOString().slice(5, 10); // "MM-DD"
    const currentYear = today.getFullYear();

    // Buscar memorias de este día en otros años
    const { data: memories, error } = await supabase
        .from('memories')
        .select('*');

    if (error) {
        console.error("Error al obtener memorias:", error);
        return;
    }

    const ghostsOfPast = memories.filter(m => {
        const mDate = new Date(m.date);
        const mMonthDay = m.date.slice(5, 10);
        return mMonthDay === monthDay && mDate.getFullYear() < currentYear;
    });

    if (ghostsOfPast.length > 0) {
        console.log(`¡Se encontraron ${ghostsOfPast.length} recuerdos!`);

        for (const memory of ghostsOfPast) {
            const years = currentYear - new Date(memory.date).getFullYear();
            const message = `🌟 Eco del Pasado: Hace ${years} años, vivisteis: "${memory.title}"`;

            // Aquí podrías enviar un email si tuvieras servicio de email configurado.
            // De momento, insertamos un "Sistema de Notificación" que la App leerá.
            // Usamos una tabla que vamos a suponer que existe o podemos crear.
            // Por simplicidad en este paso, insertaremos una "Memoria de Sistema" temporal.

            await supabase.from('memories').insert([{
                title: "🐚 Un Eco ha despertado...",
                content: `Recordad este momento de hace ${years} años: <b>${memory.title}</b>. El tiempo pasa, pero la esencia permanece.`,
                date: new Date().toISOString().split('T')[0],
                type: 'note',
                color: '#FFF',
                tags: ['eco', 'sistema'],
                user_id: memory.user_id // Se lo mandamos al mismo usuario que lo creó
            }]);
        }
    } else {
        console.log("No hay ecos para hoy.");
    }
}

run();
