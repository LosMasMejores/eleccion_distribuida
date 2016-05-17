#Lanza un determinado proceso nodejs en varias mAquinas remotas host con PM2
#usage lanzar [user@]host...
#p.ej. lanzar 172.3.4.100 172.3.4.101 ...
#Modificado a partir del ejemplo de practicas

PROYECTO="eleccion_distribuida"

if [ $# -ge 1 ]
then

  for host in "$@"
  do
    #comenzar el agente ssh
    echo "Starting SSH agent"
    eval $(ssh-agent -s)

    #agnadir la clave privada a la cachE
    echo "Adding private key to cache"
    ssh-add ~/.ssh/id_rsa

    echo "Descargando proyecto $PROYECTO en mAquina $host"
    ssh $host "git clone https://github.com/LosMasMejores/$PROYECTO.git; exit"

    echo "Instalando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; npm install; exit"

    #Descomentar si no esta instalado PM2 en la maquina
    #echo "Instalando PM2 en mAquina $host"
    #ssh $host "sudo npm install pm2 -g; exit"

    echo "Arrancando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; pm2 start ./bin/www; exit"
  done

else
  echo "Uso: $0 [user@]host..."
  exit
fi
