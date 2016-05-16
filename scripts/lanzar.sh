#Lanza un determinado proceso java en una mAquina remota host, con los par?metros param1, param2 (extensible a mAs par?metros o mAquinas)
#usage lanzar [user@]host param1 param2
#p.ej. lanzar 172.3.4.100 0 128.34.5.0

PROYECTO="eleccion_distribuida"

if [ $# -ge 1 ]
then

  for host in "$@"
  do
    echo "Descargando proyecto $PROYECTO en mAquina $host"
    ssh $host "git clone https://github.com/LosMasMejores/$PROYECTO.git; exit"

    echo "Instalando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; npm install; exit"

    #echo "Instalando PM2 en mAquina $host"
    #ssh $host "sudo npm install pm2 -g; exit"

    echo "Arrancando proyecto $PROYECTO en mAquina $host"
    ssh $host "cd $PROYECTO; pm2 start ./bin/www; exit"
  done

else
  echo "Uso: $0 [user@]host..."
  exit
fi
