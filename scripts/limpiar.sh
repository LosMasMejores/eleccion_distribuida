#limpia cualquier carpeta con nombre $2 en la mAquina@usuario $1

PROYECTO="eleccion_distribuida"

if [ $# -ge 1 ]
then

  for host in "$@"
  do
    echo "Parando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; pm2 stop ./bin/www; exit"

    echo "Eliminando proyecto $PROYECTO en mAquina $host"
    ssh $host "rm -r $PROYECTO; exit"

    echo "Desinstalando PM2 en mAquina $host"
    ssh $host "npm unistall pm2 -g; exit"
  done

else
  echo "Uso: $0 [user@]host..."
  exit
fi
