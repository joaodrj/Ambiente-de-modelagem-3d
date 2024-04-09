paper.install(window);

window.onload = function() {
    paper.setup('myCanvas');

    // Área da biblioteca e área de trabalho divididas por uma linha
    let divider = paper.view.bounds.width * 0.25;
    new Path.Line({
        from: [divider, 0],
        to: [divider, paper.view.bounds.height],
        strokeColor: 'lightgray',
        strokeWidth: 2,
    });

    // Define os tipos de forma na biblioteca
    let libraryShapes = [
        { type: 'rectangle', point: [50, 80], size: [60, 60], fillColor: 'blue' },
        { type: 'circle', point: [50, 180], radius: 30, fillColor: 'red' },
        { type: 'triangle', point: [50, 280], sides: 3, radius: 30, fillColor: 'green' },
        { type: 'hexagon', point: [50, 380], sides: 6, radius: 30, fillColor: 'yellow' },
    ];

    // Função para criar uma nova instância de forma na área de trabalho
    function createShape(shape, point) {
        let newShape;
        switch (shape.type) {
            case 'rectangle':
                newShape = new Path.Rectangle({
                    point: [point.x - shape.size[0] / 2, point.y - shape.size[1] / 2],
                    size: shape.size,
                    fillColor: shape.fillColor,
                });
                break;
            case 'circle':
                newShape = new Path.Circle({
                    center: point,
                    radius: shape.radius,
                    fillColor: shape.fillColor,
                });
                break;
            case 'triangle':
            case 'hexagon':
                newShape = new Path.RegularPolygon({
                    center: point,
                    sides: shape.sides,
                    radius: shape.radius,
                    fillColor: shape.fillColor,
                });
                break;
        }
        addInteraction(newShape);
        return newShape;
    }

    function addInteraction(shape) {
        let hitOptions = { segments: true, stroke: true, fill: true, tolerance: 5 };
        let mode, startPoint, startSize, startRotation, startDistance;
    
        shape.onMouseDown = function(event) {
            if (event.point.x < divider) return; // Ignora cliques na área da biblioteca
            mode = event.modifiers.shift ? 'resize' : event.modifiers.alt ? 'rotate' : 'move';
            startPoint = event.point;
            startSize = shape.bounds.size;
            startRotation = shape.rotation;
            startDistance = startPoint.subtract(shape.position).length; // Distância inicial do ponto de clique ao centro da forma
        };
    
        shape.onMouseDrag = function(event) {
            switch (mode) {
                case 'move':
                    shape.position = shape.position.add(event.delta);
                    break;
                case 'resize':
                    // Calcula a nova distância do ponto atual ao centro da forma
                    let currentDistance = event.point.subtract(shape.position).length;
                    // Calcula o fator de escala baseado na mudança da distância
                    let scaleRatio = currentDistance / startDistance;
                    // Aplica o fator de escala à forma
                    shape.scale(scaleRatio);
                    // Atualiza a distância inicial para a próxima iteração
                    startDistance = currentDistance;
                    break;
                case 'rotate':
                    let rotationSpeed = event.delta.x / 20; // Adiciona um divisor para diminuir a velocidade de rotação
                    shape.rotate(rotationSpeed, shape.position);
                    break;
            }
        };
    }
    
    
    

    // Desenha formas na biblioteca e adiciona evento para criar instâncias na área de trabalho
    libraryShapes.forEach(shape => {
        let libraryShape = createShape(shape, new Point(shape.point));
        libraryShape.onClick = function(event) {
            if (event.point.x < divider) {
                createShape(shape, new Point(divider + 100, event.point.y)); // Cria na área de trabalho
            }
        };
    });
};
