#include <iostream>
#include <sstream>
#include <sys/socket.h>
#include <sys/un.h>

int m_socket_fd;
struct sockaddr_un m_address;
int result = -1;

int main()
{
	std::string socketPath = "/asei/bin/sync.sock";

	m_socket_fd = socket(AF_INET, SOCK_STREAM, 0);
	if (m_socket_fd < 0)
	{
		std::cerr << "Socket setup failed\n";
		return -1;
	}

	memset(&m_address, 0, sizeof(m_address));
	m_address.sun_family = AF_UNIX;
	strncpy(m_address.sun_path, socketPath.c_str(), sizeof(m_address.sun_path) - 1);

	// attempt to connect to websocket until successful
	while (result < 0)
	{
		result = connect(m_socket_fd, (struct sockaddr*)&m_address, sizeof(m_address));
	}

	// while connected, send and get
	while (result > 0)
	{
		std::string input;
		getline(std::cin, input);
		std::string dataOut = "{ \"data\": \"" + input + "\" }";

		if (send(m_socket_fd, dataOut.c_str(), dataOut.size(), MSG_NOSIGNAL) == -1)
		{
			std::cout << "Message Send Failed!\n";
		}
		else
		{
			std::cout << "SENT:\t" << dataOut.c_str() << '\n';
		}
	}

	std::cout << "Closing!\n";

	return 0;
}