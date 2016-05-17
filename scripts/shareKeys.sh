#Este script permite evitar que se nos pida la contrase?a cada vez que hagamos un ssh
#Modificado a partir del ejemplo de practicas

if [ $# -ge 1 ]
then

  if [ ! -f ~/.ssh/id_rsa ]
    then
    echo "Setting public and private keys on $host"
    #crear el par de claves
    ssh-keygen
  fi

  for host in "$@"
  do
    #copiar la clave pUblica al servidor remoto
    echo "Copying key to remote server"
    scp ~/.ssh/id_rsa.pub $host:pubkey.txt
    ssh $host "mkdir ~/.ssh; chmod 700 .ssh; cat pubkey.txt >> ~/.ssh/authorized_keys; rm ~/pubkey.txt; chmod 600 ~/.ssh/*; exit"
  done

else
  echo "Uso: $0 [user@]host..."
  exit
fi
