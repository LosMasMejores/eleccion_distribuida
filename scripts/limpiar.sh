#Limpia el proyecto $PROYECTO en las mAquinas@usuario $1
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

    echo "Parando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; pm2 stop ./bin/www; exit"

    echo "Eliminando proyecto $PROYECTO en mAquina $host"
    ssh $host "rm -r $PROYECTO; exit"

    #Descomentar si queremos desintalar PM2 de la maquina
    #echo "Desinstalando PM2 en mAquina $host"
    #ssh $host "sudo ·npm unistall pm2 -g; exit"
  done

else
  echo "Uso: $0 [user@]host..."
  exit
fi
