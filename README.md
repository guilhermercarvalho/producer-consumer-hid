
# Pequisar

## Dependencias

- [ ] react, useState, useEffect
- [ ] react-chartjs-2, Line
- [ ] chart.js, Chart, registerables
- [ ] lucide, lucide-react, icons?

## Lógica de negócio

### Questionamentos para rever?

- [ ] não tem lógica para funcionalidade de criar
    - SOLUÇÃO: criar componente e integrar com API
- [ ] permitir salvar outros presets de config durante sessão
- [ ] adicionar helthcheck da api antes de realizar requisição
    - /healthcheck timeout 5 segundos

### primeira versão de APP integrado com API

- URL da API: localhost:5000
- POLL_INTERVAL_IN_MILISECCONDS: intervalo de requisição à \/status\/\<proc_id\> (DEFAULT 3 segundos)
- Types:
    - ProcessConfig: representa os parametros da execução do processo
        - producer_delay, consumer_delay, buffer_type
            - delay em milisegundos
    - ProcessStatus: estatísticas do processo
        - id, config, metrics, buffer_itens(redis)/buffer_total_size(queue), last_updated
- App: Aplicação principal
    - incia instânciando
        - processesStatus: lista com status dos processos (ProcessStatus), DEFAULT = `[]`
        - selectedProcess: status processo selecionado (atual), DEFAULT = `null`
        - config: parametros de configuração do processo, DEFAULT = `{ produce_delay: 1000, consumer_delay: 1500, buffer_type: 'queue'`
    - handles:
        - startProcess: inicia processo com config DEFAULT
            - req `POST` `/start`
            - body (json): config DEFAULT
            - res `proc_id`
            - setProcessesStatus: adiciona status do processo à lista de processos
            - ERROR: notifica usuário (envia causa via notificação interna)
        - stopProcess(proc_id): para processo manualmente
            - req `POST` `/stop/<proc_id>`
            - setProcessesStatus: remove processo da lista de `processos em execução`
            - selectedProcess = null: remove desceleciona processo
            - res (json): mensagem de parada de processo
            - ERROR: notifica usuário (envia causa via notificação interna)
        - updateProcessStatus(proc_id): atualiza status dos processos atuais
            - req `GET` `/status/<proc_id>`
            - res (json): métricas atualizadas
            - setProcessesStatus: atualiza item com `<id = proc_id>`
                - efficiency, metrics, buffer_itens(redis)/buffer_total_size, last_updated
    - useEffects
        - [processesStatus]: executar sempre que var useState se atualizar
            - intervals: percore processesStatus definindo intervalo `POLL_INTERVAL_MILISECCONDS`
            - executa `updateProcessStatus(proc.id)`
            - retorna intervals.forEach(clearInterval)
    - presetConfigs: exemplos de configurações
    - componentes
        - nav
        - main
            - title
            - description
            - controls
                - producer_delay: input number
                - consumer_delay: input number
                - buffer_type: select list dropdown
                - presets
                    - n butons
                        - name
                        - description
                - play: botão que executa `startProcess`
            - list process
                - item
                    - name (id), config
                    - status, last update
                    - buffer
                        - queue: table total size
                        - redis: itens produzidos
                    - produzidos
                    - consumidos
                    - eficiência
                    - throughput
                    - tag
                        - running
                        - stoped
                        - executed
        - footer
