#include <iostream>
#include <sstream>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>
#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"

int m_socket_fd;
struct sockaddr_un m_sock_address;
int result = -1;
#define SOCKET_LOCATION "../web-server/sync.sock";
#define INVALID_SOCKET -1
bool m_connected_to_server = false;

int main()
{
	std::stringstream socket_path;
	socket_path << SOCKET_LOCATION;

	if (m_socket_fd != INVALID_SOCKET)
	{
		close(m_socket_fd);
		m_socket_fd = INVALID_SOCKET;
	}
	if ((m_socket_fd = socket(AF_UNIX, SOCK_STREAM, 0)) < 0)
	{
		std::cerr << "Socket Creation Error" << std::endl;
		return -1;
	}
	memset(&m_sock_address, 0, sizeof(m_sock_address));
	m_sock_address.sun_family = AF_UNIX;
	strncpy(m_sock_address.sun_path, socket_path.str().c_str(), sizeof(m_sock_address.sun_path) - 1);

	// attempt to connect
	int result = -1;
	do {
		std::cerr << "Looking for " << socket_path.str() << std::endl;
		result = connect(m_socket_fd, (struct sockaddr*)&m_sock_address, sizeof(m_sock_address));

		if (result == 0) // good connection
		{
			m_connected_to_server = true;
			std::cout << "Connected on " << socket_path.str() << '\n';
		}
		else // else bad connection - wait 1s before retrying.
		{
			sleep(1);
		}
	} while (!m_connected_to_server);

	// while connected, send and get
	while (m_connected_to_server)
	{
		std::cout << "> ";
		std::string input = "HELLO WORLD!";
		std::cout << "input: " << input << '\n';
		std::stringstream dataOut;
		//dataOut << "{\"type\":\"layout\",";
		//dataOut << "\"name\":\"" << input << "\"";
		//dataOut << "{\"data\":\"" << input << "\"}";
		dataOut << "{\"serial\":\"12345984\",";
		dataOut << "\"swVersion\":\"1.0.5\",";
		dataOut << "\"buildNum\":\"1.2\",";
		dataOut << "\"gpsVersion\":\"1.0.4\",";
		dataOut << "\"ipAddress\":\"192.168.1.121\"}";
		std::string msg = dataOut.str();

		if (send(m_socket_fd, msg.c_str(), msg.size(), MSG_NOSIGNAL) == -1)
		{
			std::cout << "Message Send Failed!\n";
		}
		else
		{
			std::cout << "SENT:\t" << msg.c_str() << '\n';
		}

		sleep(100000);
		
		/*
		
		
		recv(m_socket_fd, )
		*/	
	}

	std::cout << "Closing!\n";

	return 0;
}