import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native';

export default function App() {
  let url = "http://172.24.208.1:3000";
  // SIMULAR GET
  const Find = () => {
    fetch(url)
      .then(resp => resp.json())
      .then(json => console.log(json))
      .catch(e => { console.log(e) })
  }

  // ADICIONAR USUARIO 
  const insertOne = () => {
    fetch(url + "/add", {
      method: 'POST',
      body: JSON.stringify(
        {
          name: 'Emerson Rocha'
        }
      ),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      }
    })
      .then(resp => resp.json())
      .then(json => console.log(json))
      .catch(e => { console.log(e) })
  }

  const deleteOne = (X) => {
   
    fetch(`${url}/${X}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(json => console.log(json))
  }


  return (
    <View style={styles.container}>
      <Button
        title='Find()'
        onPress={() => Find()}
      />
      <View style={{ height: 5 }}></View>
      <Button
        title='insertOne()'
        onPress={() => insertOne()}
      />
      <View style={{ height: 5 }}></View>
      <Button
        title='deleteOne()'
        onPress={() => deleteOne('69e967626850c2fe9d79f83d')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
