# Comentarios, DMs y objeciones (AiUDA Inbox)

## Flujo
1. Evento (webhook) → guardar crudo → clasificar (intención, sentimiento, idioma, riesgo).
2. Decidir: **responder solo**, **responder y capturar lead**, **escalar a humano** o **ignorar/ocultar** (spam, odio según reglas del cliente).
3. Responder con voz de marca desde la base de conocimiento del cliente; registrar en la conversación y en el CRM/lead.
4. Seguimiento programado si el lead no contesta (dentro de la ventana permitida por la plataforma).

## Clasificación de intención
Pregunta de precio · disponibilidad · ubicación/horarios · cómo comprar · soporte/postventa · queja · elogio · spam · oportunidad de venta · prensa/alianza · fuera de tema.

## Reglas de respuesta
- Primero comentario público corto + invitación a DM (respuesta privada permitida por Meta; ⚠️ verificar ventana y límites).
- Nunca inventar precio ni promesa. Si no está en la base → «Te confirmo y te escribo» + escalar.
- Tono por cliente (formal/cercano/técnico), nunca discutir, nunca responder al troll más de una vez.
- Retraso humano de segundos; no ráfagas.
- Preguntas de calificación suaves (máx. 3): necesidad, presupuesto/plazo, contacto. Cada dato capturado se guarda como campo del lead.

## Manejo de objeciones (marco)
| Objeción | Enfoque |
|---|---|
| «Es caro» | Reencuadrar en valor/retorno, ofrecer opciones/plan de pago **solo si existe en la base** |
| «Lo voy a pensar» | Preguntar qué duda falta, ofrecer ayuda concreta, agendar seguimiento |
| «No confío» | Prueba social real, garantías reales del cliente, ofrecer hablar con una persona |
| «Ya tengo proveedor» | Reconocer, ofrecer diferencial real, dejar puerta abierta |
| «No es el momento» | Preguntar cuándo, programar recordatorio |
Cada cliente carga en el diagnóstico sus objeciones reales y sus respuestas aprobadas; el agente usa **esas**.

## Escalamiento inmediato
Queja grave, legal/salud/finanzas, amenaza, reembolso, prensa, cliente VIP, baja confianza del modelo, 2.º insulto.

## Métricas
Tiempo de primera respuesta, % resuelto sin humano, % escalado, leads capturados, conversión DM→venta, satisfacción.
