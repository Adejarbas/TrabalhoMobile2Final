import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export default function App() {
  // ---- CONFIGURAÇÃO ----
  let url = "http://10.75.126.85:3333";

  // ---- ESTADO DO FORMULÁRIO ----
  const [nome, setNome] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('');

  // ---- ESTADO GERAL ----
  const [clientes, setClientes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [banco, setBanco] = useState('mongo');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [limite, setLimite] = useState(5); // Paginação de 5 em 5
  const [idEditando, setIdEditando] = useState(null);

  // ---- LIMPAR FORMULÁRIO ----
  const limparFormulario = () => {
    setIdEditando(null);
    setNome('');
    setCep('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('');
    setEstado('');
    setComplemento('');
  };

  // ---- BUSCAR CEP NO VIACEP ----
  const buscarCep = (valorCep) => {
    setCep(valorCep);

    // Só busca quando tiver 8 dígitos
    if (valorCep.length === 8) {
      setBuscandoCep(true);
      setRua('');
      setBairro('');
      setCidade('');
      setEstado('');

      fetch(`https://viacep.com.br/ws/${valorCep}/json/`)
        .then(resp => resp.json())
        .then(dados => {
          setBuscandoCep(false);
          if (dados.erro) {
            Alert.alert('CEP não encontrado', 'Verifique o CEP digitado.');
            return;
          }
          // Preenche os campos automaticamente
          setRua(dados.logradouro || '');
          setBairro(dados.bairro || '');
          setCidade(dados.localidade || '');
          setEstado(dados.uf || '');
          setComplemento(dados.complemento || '');
        })
        .catch(e => {
          setBuscandoCep(false);
          Alert.alert('Erro', 'Nao foi possivel buscar o CEP.');
          console.log("Erro ViaCEP:", e);
        });
    }
  };

  // ---- BUSCAR TODOS OS CLIENTES (GET) ----
  const buscarClientes = (bancoSelecionado) => {
    // Evita que objetos de evento (cliques de botões) sejam passados como string
    const bancoReal = typeof bancoSelecionado === 'string' ? bancoSelecionado : banco;
    
    setMensagem(`Carregando clientes do ${bancoReal === 'mongo' ? 'MongoDB' : 'SQLite'}...`);
    fetch(`${url}?banco=${bancoReal}`)
      .then(resp => resp.json())
      .then(json => {
        setMensagem('');
        setClientes(json);
      })
      .catch(e => {
        setMensagem('Erro ao buscar clientes.');
        console.log("Erro no Find:", e);
      });
  };

  // ---- CADASTRAR NOVO CLIENTE (POST) ----
  const cadastrarNovoCliente = () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatorio', 'Digite o nome do cliente.');
      return;
    }
    if (cep.trim() && cep.length < 8) {
      Alert.alert('CEP invalido', 'O CEP deve ter 8 digitos.');
      return;
    }

    setMensagem('Cadastrando...');
    fetch(`${url}/add`, {
      method: 'POST',
      body: JSON.stringify({
        name: nome, cep, rua, numero, bairro, cidade, estado, complemento, banco
      }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    })
      .then(resp => resp.json())
      .then(json => {
        setMensagem('');
        limparFormulario();
        Alert.alert('Sucesso!', 'Cliente cadastrado com sucesso.');
        buscarClientes(banco);
      })
      .catch(e => {
        setMensagem('Erro ao cadastrar.');
        console.log("Erro no POST:", e);
      });
  };

  // ---- ATUALIZAR CLIENTE (PUT) ----
  const atualizarCliente = () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatorio', 'Digite o nome do cliente.');
      return;
    }
    if (cep.trim() && cep.length < 8) {
      Alert.alert('CEP invalido', 'O CEP deve ter 8 digitos.');
      return;
    }

    setMensagem('Atualizando...');
    fetch(`${url}/${idEditando}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: nome, cep, rua, numero, bairro, cidade, estado, complemento, banco
      }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    })
      .then(resp => resp.json())
      .then(json => {
        setMensagem('');
        limparFormulario();
        Alert.alert('Sucesso!', 'Cliente atualizado com sucesso.');
        buscarClientes(banco);
      })
      .catch(e => {
        setMensagem('Erro ao atualizar.');
        console.log("Erro no PUT:", e);
      });
  };

  // ---- REMOVER CLIENTE (DELETE) ----
  const removerCliente = (id) => {
    Alert.alert(
      'Confirmar remocao',
      'Deseja remover este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            fetch(`${url}/${id}?banco=${banco}`, { method: 'DELETE' })
              .then(res => res.json())
              .then(() => buscarClientes(banco))
              .catch(e => console.log("Erro no deleteOne:", e));
          }
        }
      ]
    );
  };

  // ---- CARREGAR DADOS PARA EDITAR ----
  const carregarParaEditar = (cliente) => {
    setIdEditando(cliente._id);
    setNome(cliente.name || '');
    setCep(cliente.cep || '');
    setRua(cliente.rua || '');
    setNumero(cliente.numero || '');
    setBairro(cliente.bairro || '');
    setCidade(cliente.cidade || '');
    setEstado(cliente.estado || '');
    setComplemento(cliente.complemento || '');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* CABECALHO */}
      <View style={styles.header}>
        <Text style={styles.headerNome}>PIZZARIA</Text>
        <Text style={styles.headerTitulo}>DAN Pizzas</Text>
        <Text style={styles.headerSub}>Cadastro de Clientes</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>

        {/* CARD DE CADASTRO */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Novo Cliente</Text>

          {/* NOME */}
          <Text style={styles.label}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Daniel Silva"
            placeholderTextColor="#555"
            value={nome}
            onChangeText={setNome}
          />

          {/* CEP */}
          <Text style={styles.label}>
            CEP * {buscandoCep ? <Text style={styles.labelBuscando}> buscando...</Text> : null}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 01001000"
            placeholderTextColor="#555"
            value={cep}
            onChangeText={buscarCep}
            keyboardType="numeric"
            maxLength={8}
          />

          {/* RUA */}
          <Text style={styles.label}>Rua</Text>
          <TextInput
            style={[styles.input, styles.inputAutomatic]}
            placeholder=""
            placeholderTextColor="#444"
            value={rua}
            onChangeText={setRua}
            editable={true}
          />

          {/* NUMERO */}
          <Text style={styles.label}>Numero *</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#555"
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
          />

          {/* BAIRRO */}
          <Text style={styles.label}>Bairro</Text>
          <TextInput
            style={[styles.input, styles.inputAutomatic]}
            placeholder=""
            placeholderTextColor="#444"
            value={bairro}
            onChangeText={setBairro}
          />

          {/* CIDADE e ESTADO lado a lado */}
          <View style={styles.linha}>
            <View style={styles.linhaItemGrande}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={[styles.input, styles.inputAutomatic]}
                placeholder=""
                placeholderTextColor="#444"
                value={cidade}
                onChangeText={setCidade}
              />
            </View>
            <View style={styles.linhaItemPequeno}>
              <Text style={styles.label}>UF</Text>
              <TextInput
                style={[styles.input, styles.inputAutomatic]}
                placeholder=""
                placeholderTextColor="#555"
                value={estado}
                onChangeText={setEstado}
                maxLength={2}
              />
            </View>
          </View>

          {/* COMPLEMENTO */}
          <Text style={styles.label}>Complemento (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#555"
            value={complemento}
            onChangeText={setComplemento}
          />

          {/* SELETOR DE BANCO */}
          <Text style={styles.label}>Salvar em</Text>
          <View style={styles.bancoSeletor}>
            <TouchableOpacity
              style={[styles.bancoBtn, banco === 'mongo' && styles.bancoBtnAtivo]}
              onPress={() => {
                setBanco('mongo');
                buscarClientes('mongo');
              }}
            >
              <Text style={[styles.bancoBtnTexto, banco === 'mongo' && styles.bancoBtnTextoAtivo]}>MongoDB</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bancoBtn, banco === 'sqlite' && styles.bancoBtnAtivo]}
              onPress={() => {
                setBanco('sqlite');
                buscarClientes('sqlite');
              }}
            >
              <Text style={[styles.bancoBtnTexto, banco === 'sqlite' && styles.bancoBtnTextoAtivo]}>SQLite</Text>
            </TouchableOpacity>
          </View>

          {/* BOTOES ACAO */}
          <View style={styles.botoesAcao}>
            <TouchableOpacity style={styles.btnLimpar} onPress={limparFormulario}>
              <Text style={styles.btnLimparTexto}>LIMPAR</Text>
            </TouchableOpacity>
            {!idEditando ? (
              <TouchableOpacity style={styles.btnPrincipal} onPress={cadastrarNovoCliente}>
                <Text style={styles.btnPrincipalTexto}>CADASTRAR</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnAtualizar} onPress={atualizarCliente}>
                <Text style={styles.btnPrincipalTexto}>ATUALIZAR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* BOTAO VER CLIENTES */}
        <TouchableOpacity style={styles.btnSecundario} onPress={() => buscarClientes(banco)}>
          <Text style={styles.btnSecundarioTexto}>VER TODOS OS CLIENTES</Text>
        </TouchableOpacity>

        {/* MENSAGEM DE STATUS */}
        {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}

        {/* LISTA DE CLIENTES */}
        {clientes.length > 0 ? (
          <View>
            <Text style={styles.listaTitulo}>Clientes Cadastrados — {clientes.length}</Text>
            {clientes.slice(0, limite).map((cliente, index) => (
              <View key={cliente._id} style={styles.clienteCard}>

                {/* NOME E NÚMERO */}
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteNumero}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={{flex: 1}}>
                    <Text style={styles.clienteNome} numberOfLines={1}>{cliente.name}</Text>
                    {cliente.rua ? (
                      <Text style={styles.clienteEndereco} numberOfLines={1}>
                        {cliente.rua}{cliente.numero ? `, ${cliente.numero}` : ''} - {cliente.cidade}/{cliente.estado}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* BOTOES */}
                <View style={styles.clienteAcoes}>
                  <TouchableOpacity
                    style={styles.btnAlterar}
                    onPress={() => carregarParaEditar(cliente)}
                  >
                    <Text style={styles.btnAlterarTexto}>ALTERAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnRemover}
                    onPress={() => removerCliente(cliente._id)}
                  >
                    <Text style={styles.btnRemoverTexto}>REMOVER</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {clientes.length > limite && (
              <TouchableOpacity 
                style={styles.btnMostrarMais} 
                onPress={() => setLimite(limite + 5)}
              >
                <Text style={styles.btnMostrarMaisTexto}>MOSTRAR MAIS (+5)</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },

  // CABECALHO
  header: {
    backgroundColor: '#111111',
    paddingTop: 55,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#8b1a1a',
  },
  headerNome: {
    color: '#c10e0e',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginBottom: 2,
  },
  headerTitulo: {
    color: '#f0f0f0',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSub: {
    color: '#666',
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 1,
  },

  // CONTEUDO
  content: { flex: 1 },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // CARD
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTitulo: {
    color: '#c1c1c1',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // LABELS E INPUTS
  label: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  labelBuscando: {
    color: '#8b1a1a',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#f0f0f0',
    marginBottom: 14,
  },
  inputAutomatic: {
    borderColor: '#222',
    backgroundColor: '#111',
  },

  // LINHA CIDADE + ESTADO
  linha: {
    flexDirection: 'row',
    gap: 10,
  },
  linhaItemGrande: {
    flex: 3,
  },
  linhaItemPequeno: {
    flex: 1,
  },

  // SELETOR DE BANCO
  bancoSeletor: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  bancoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  bancoBtnAtivo: {
    borderColor: '#8b1a1a',
    backgroundColor: '#1f0808',
  },
  bancoBtnTexto: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  bancoBtnTextoAtivo: {
    color: '#f0f0f0',
  },

  // BOTOES ACAO
  botoesAcao: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnLimpar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  btnLimparTexto: {
    color: '#aaa',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  btnPrincipal: {
    flex: 2,
    backgroundColor: '#8b1a1a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  btnPrincipalTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  btnAtualizar: {
    flex: 2,
    backgroundColor: '#0a591e', // Verde para atualizar
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },

  // BOTAO SECUNDARIO
  btnSecundario: {
    borderWidth: 1,
    borderColor: '#8b1a1a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnSecundarioTexto: {
    color: '#c4c4c4',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },

  // MENSAGEM
  mensagem: {
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },

  // LISTA
  listaTitulo: {
    color: '#aaa',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  clienteCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clienteNumero: {
    color: '#8b1a1a',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 12,
    marginTop: 2,
  },
  clienteNome: {
    color: '#f0f0f0',
    fontSize: 15,
    fontWeight: '600',
  },
  clienteEndereco: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  clienteAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAlterar: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  btnAlterarTexto: {
    color: '#c4c4c4',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  btnRemover: {
    borderWidth: 1,
    borderColor: '#8b1a1a',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  btnRemoverTexto: {
    color: '#e4e3e3',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  btnMostrarMais: {
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  btnMostrarMaisTexto: {
    color: '#8b1a1a',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
