HTML
The initial HTML to display.

onShow JS
Optional code that runs when the widget is shown. Ran in an async function (await is supported).
The following variables are available:
- containerElement (the root HTML element of the widget)
- widgetId (this widget's unique ID)
- widgetState (the current state of the widget, if any)
- utils.sendMessageToFirebot(messageName: string, messageData?: any) (utility function to send a message back to Firebot)

onStateUpdate JS
Optional code that runs when the widget's state is updated via the Update Custom Widget State effect. Ran in an async function (await is supported).
The following variables are available:
- containerElement (the root HTML element of the widget)
- widgetId (this widget's unique ID)
- widgetState (the current state of the widget, if any)
- utils.sendMessageToFirebot(messageName: string, messageData?: any) (utility function to send a message back to Firebot)

onMessage JS
Optional code that runs when the widget receives a message from the Send Message To Custom Widget effect. Ran in an async function (await is supported).
The following variables are available:
- containerElement (the root HTML element of the widget)
- widgetId (this widget's unique ID)
- widgetState (the current state of the widget, if any)
- messageName (the name of the received message)
- messageData (the data sent with the message, if any)
- utils.sendMessageToFirebot(messageName: string, messageData?: any) (utility function to send a message back to Firebot)